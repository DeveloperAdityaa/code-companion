import { framer } from "framer-plugin"
import { useState, useRef, useEffect } from "react"

framer.showUI({
    position: "top right",
    width: 350,
    height: 600,
})

type ChatMessage = {
    id: string
    type: 'user' | 'ai'
    content: string
    code?: string
    guide?: string
    timestamp: Date
}

export function App() {
    const [input, setInput] = useState("")
    const [messages, setMessages] = useState<ChatMessage[]>([{
        id: '1',
        type: 'ai',
        content: "Welcome! Describe the component you want to create and I'll help you build it.",
        timestamp: new Date()
    }])
    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value)
        if (textareaRef.current) {
            textareaRef.current.style.height = '44px'
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
        }
    }

    const handleSubmit = async () => {
        if (!input.trim() || loading) return

        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: input,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, newMessage])
        setInput("")
        setLoading(true)

        if (textareaRef.current) {
            textareaRef.current.style.height = '44px'
        }

        const chatContext = messages
            .filter(m => m.code)
            .map(m => `${m.type === 'user' ? 'User' : 'AI'}: ${m.content}\nCode:\n${m.code}`)
            .join("\n---\n")

        const systemPrompt = `
You are a senior Framer developer. Based on the following instruction, generate a valid Framer React code component that can be used inside Framer's code panel.
Follow this guide: https://www.framer.com/developers/components-introduction
Output ONLY the code. Do NOT add explanation or markdown formatting.

${chatContext ? chatContext + "\n---\n" : ""}
User: ${input}
        `.trim()

        try {
            const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "deepseek-coder",
                    messages: [{ role: "user", content: systemPrompt }],
                    temperature: 0.7
                })
            })

            const data = await response.json()
            const result = data.choices?.[0]?.message?.content?.trim()
            const cleaned = result.replace(/```(?:typescript)?|```/g, "").trim()

            if (cleaned) {
                const aiResponse: ChatMessage = {
                    id: Date.now().toString(),
                    type: 'ai',
                    content: "Here's your component code:",
                    code: cleaned,
                    guide: "To use this component in Framer:\n1. Create a new code file in your project\n2. Paste this code\n3. Save the file\n4. The component will appear in your assets panel",
                    timestamp: new Date()
                }
                setMessages(prev => [...prev, aiResponse])
            } else {
                framer.notify("Failed to generate code")
            }
        } catch (err) {
            console.error(err)
            framer.notify("Error generating component")
        }

        setLoading(false)
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }

    const handleCopy = async (code: string) => {
        try {
            await navigator.clipboard.writeText(code)
            framer.notify("Copied to clipboard")
        } catch {
            framer.notify("Copy failed")
        }
    }

    return (
        <div className="flex flex-col h-full bg-[var(--framer-color-bg)]">
            <div className="flex-1 overflow-y-auto px-[15px] py-3 space-y-3">
                {messages.map((msg) => (
                    <div key={msg.id} className="w-full">
                        <div className={`rounded-md p-3 text-xs ${
                            msg.type === 'user' 
                                ? 'bg-[var(--framer-color-tint)] text-[var(--framer-color-text-reversed)]' 
                                : 'bg-[var(--framer-color-bg-secondary)] text-[var(--framer-color-text)]'
                        }`}>
                            {msg.content}
                        </div>
                        {msg.code && (
                            <div className="mt-3 border border-[var(--framer-color-divider)] rounded-md overflow-hidden">
                                <div className="p-3 bg-[var(--framer-color-bg)]">
                                    <pre className="text-xs font-mono text-[var(--framer-color-text)] whitespace-pre-wrap leading-relaxed">
                                        {msg.code}
                                    </pre>
                                </div>
                            </div>
                        )}
                        {msg.guide && (
                            <div className="mt-3 border border-[var(--framer-color-tint-dimmed)] rounded-md overflow-hidden">
                                <div className="px-3 py-2 bg-[var(--framer-color-tint-dimmed)] border-b border-[var(--framer-color-tint-dimmed)]">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-3.5 h-3.5 text-[var(--framer-color-tint)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="font-medium text-xs text-[var(--framer-color-text)]">How to use this component</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-[var(--framer-color-bg)]">
                                    <ol className="space-y-2">
                                        <li className="flex items-start gap-2">
                                            <span className="flex-none flex items-center justify-center w-5 h-5 rounded-full bg-[var(--framer-color-tint-dimmed)] text-[var(--framer-color-tint)] text-xs font-medium">1</span>
                                            <span className="text-xs text-[var(--framer-color-text)]">Create a new code file in your project</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="flex-none flex items-center justify-center w-5 h-5 rounded-full bg-[var(--framer-color-tint-dimmed)] text-[var(--framer-color-tint)] text-xs font-medium">2</span>
                                            <span className="text-xs text-[var(--framer-color-text)]">Paste this code</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="flex-none flex items-center justify-center w-5 h-5 rounded-full bg-[var(--framer-color-tint-dimmed)] text-[var(--framer-color-tint)] text-xs font-medium">3</span>
                                            <span className="text-xs text-[var(--framer-color-text)]">Save the file</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="flex-none flex items-center justify-center w-5 h-5 rounded-full bg-[var(--framer-color-tint-dimmed)] text-[var(--framer-color-tint)] text-xs font-medium">4</span>
                                            <span className="text-xs text-[var(--framer-color-text)]">The component will appear in your assets panel</span>
                                        </li>
                                    </ol>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                {loading && (
                    <div className="self-center px-3 py-1.5 text-xs text-[var(--framer-color-text-secondary)] bg-[var(--framer-color-bg-secondary)] rounded-md flex items-center gap-1.5">
                        <span>●</span> Generating component...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="px-[15px] pb-3 pt-3 border-t border-[var(--framer-color-divider)]">
                <div className="space-y-2">
                    <textarea
                        ref={textareaRef}
                        className="w-full min-h-[32px] px-2.5 py-1.5 text-xs text-[var(--framer-color-text)] border border-[var(--framer-color-divider)] rounded-[4px] resize-none focus:outline-none focus:border-[var(--framer-color-tint)] placeholder:text-[var(--framer-color-text-tertiary)] bg-[var(--framer-color-bg-secondary)]"
                        placeholder="Type your component description..."
                        value={input}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        rows={1}
                    />
                    <div className="flex flex-col gap-2">
                        <button
                            className="w-full h-[32px] px-3 text-xs font-medium bg-[var(--framer-color-tint)] text-[var(--framer-color-text-reversed)] rounded-[4px] hover:bg-gray-600 active:opacity-80 disabled:bg-gray-400 disabled:cursor-not-allowed transition-opacity"
                            onClick={handleSubmit}
                            disabled={loading || !input.trim()}
                        >
                            Send
                        </button>
                        {messages.filter(m => m.code).length > 0 && (
                            <button
                                onClick={() => handleCopy(messages[messages.length - 1].code!)}
                                className="copy-button w-full h-[32px] px-3 text-xs font-medium rounded-[4px] transition-colors hover:bg-gray-600 active:opacity-80 bg-black text-white"
                            >
                                Copy Code
                            </button>
                        )}
                    </div>
                </div>
                <p className="text-xs text-[var(--framer-color-text-tertiary)] mt-3 text-center">
                    Powered by Deepseek AI
                </p>
            </div>
        </div>
    )
}


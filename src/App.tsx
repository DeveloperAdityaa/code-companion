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
        <div className="flex flex-col h-full bg-white">
            <header className="px-6 py-5 border-b border-gray-200">
                <h1 className="text-[32px] font-medium text-gray-900">Code Companion</h1>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className="w-full">
                        <div className={`rounded-lg p-4 ${
                            msg.type === 'user' 
                                ? 'bg-black text-white' 
                                : 'bg-gray-50 text-gray-900'
                        }`}>
                            {msg.content}
                        </div>
                        {msg.code && (
                            <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
                                    <button 
                                        onClick={() => handleCopy(msg.code!)}
                                        className="ml-auto px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                                    >
                                        Copy code
                                    </button>
                                </div>
                                <div className="p-4 bg-white">
                                    <pre className="text-sm font-mono text-gray-900 whitespace-pre-wrap leading-relaxed">
                                        {msg.code}
                                    </pre>
                                </div>
                            </div>
                        )}
                        {msg.guide && (
                            <div className="mt-3 border border-blue-100 rounded-lg overflow-hidden">
                                <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="font-medium text-sm text-blue-900">How to use this component</span>
                                    </div>
                                </div>
                                <div className="p-4 bg-white">
                                    <ol className="space-y-3">
                                        <li className="flex items-start gap-3">
                                            <span className="flex-none flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">1</span>
                                            <span className="text-sm text-gray-700">Create a new code file in your project</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="flex-none flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">2</span>
                                            <span className="text-sm text-gray-700">Paste this code</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="flex-none flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">3</span>
                                            <span className="text-sm text-gray-700">Save the file</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="flex-none flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">4</span>
                                            <span className="text-sm text-gray-700">The component will appear in your assets panel</span>
                                        </li>
                                    </ol>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                {loading && (
                    <div className="self-center px-3 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg flex items-center gap-1.5">
                        <span>●</span> Generating component...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="px-6 pb-6 pt-4 border-t border-gray-200">
                <div className="space-y-3">
                    <textarea
                        ref={textareaRef}
                        className="w-full min-h-[44px] px-4 py-3 text-sm text-gray-900 border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-gray-900 placeholder:text-gray-500"
                        placeholder="Type your component description..."
                        value={input}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        rows={1}
                    />
                    <button
                        className="w-full px-4 py-3 text-sm font-medium text-white bg-black rounded-lg disabled:opacity-40 disabled:text-gray-500 disabled:cursor-not-allowed"
                        onClick={handleSubmit}
                        disabled={loading || !input.trim()}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    )
}
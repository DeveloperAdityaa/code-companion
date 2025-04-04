import { framer } from "framer-plugin"
import { useState } from "react"
import "./App.css"

framer.showUI({
    position: "top right",
    width: 300,
    height: 220,
})

export function App() {
    const [prompt, setPrompt] = useState("")
    const [code, setCode] = useState("")
    const [loading, setLoading] = useState(false)

    const handleGenerate = async () => {
        if (!prompt.trim()) return
        setLoading(true)

        const systemPrompt = `
You are a senior Framer developer. Based on the following instruction, generate a valid Framer React code component that can be used inside Framer's code panel.
Follow this guide: https://www.framer.com/developers/components-introduction
Output ONLY the code. Do NOT add explanation or markdown formatting.

User Prompt: ${prompt}
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
                setCode(cleaned)
                framer.notify("✅ Code generated! Click copy to use it.")
            } else {
                framer.notify("❌ Failed to get valid code")
            }
        } catch (error) {
            console.error("Generation error:", error)
            framer.notify("❌ Error generating code")
        }

        setLoading(false)
    }

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code)
            framer.notify("📋 Code copied to clipboard!")
        } catch {
            framer.notify("❌ Clipboard copy failed.")
        }
    }

    return (
        <main>
            <h2>AI Framer Code Generator</h2>
            <textarea
                className="framer-input"
                placeholder="Describe your component (e.g. Button with hover rotate)"
                style={{ width: "100%", height: 70, padding: "6px", resize: "none" }}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
            />
            <div className="button-group">
                <button
                    className="framer-button-primary"
                    onClick={handleGenerate}
                    disabled={loading}
                >
                    {loading ? "Generating..." : "Generate"}
                </button>
            </div>
            {loading && (
                <p style={{ fontSize: 12, marginTop: 10, opacity: 0.6 }}>
                    ⏳ Thinking... Generating your component.
                </p>
            )}
            {code && !loading && (
                <>
                    <textarea
                        style={{
                            width: "100%",
                            height: "120px",
                            fontSize: "12px",
                            fontFamily: "monospace",
                            marginTop: "10px",
                            padding: "6px",
                            borderRadius: "6px",
                            resize: "none"
                        }}
                        value={code}
                        readOnly
                    />
                    <button
                        className="framer-button"
                        onClick={handleCopy}
                        style={{ marginTop: 6 }}
                    >
                        📋 Copy Code
                    </button>
                    <p style={{ fontSize: 12, marginTop: 6, opacity: 0.7 }}>
                        💡 Tip: Paste the code into a Framer Code Component.
                    </p>
                </>
            )}
        </main>
    )
}
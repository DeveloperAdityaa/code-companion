# 🧠 AI Code Companion for Framer

A Framer plugin that uses Deepseek AI to generate ready-to-use Framer **React Code Components** from plain English prompts.

## ✨ Features

- Generate Framer code components by describing them in natural language
- Copy generated code to clipboard instantly
- Clean output (no markdown or noise)
- Helpful UI with loading feedback and usage tips

## 🚀 How It Works

1. Type a description like:  
   "Create a button that rotates on hover"
2. Click **Generate**
3. The AI returns a clean Framer-compatible React component
4. Copy the code and paste it into a **Framer Code Component**

## 🧱 Tech Stack

- **Framer Plugin SDK v3**
- **React + TypeScript**
- **Deepseek Coder API** (Apache 2.0 License)
- **Vite** for fast local dev

## 🔪 Attribution

This plugin uses the Deepseek AI API for code generation. Deepseek is licensed under the Apache 2.0 License. Attribution is provided here as per the license requirements. This project does not use Deepseek’s logo or imply endorsement.

## 🔪 Local Development

1. Clone the repo:
   ```bash
   git clone https://github.com/DeveloperAdityaa/code-companion.git
   cd code-companion
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file at the root:
   ```
   VITE_DEEPSEEK_API_KEY=your_deepseek_api_key_here
   ```

4. Run the dev server:
   ```bash
   npm run dev
   ```

5. Open Framer → Plugins → **Run Plugin Locally** → Select `code-companion`

## 📦 Building

To build the plugin for publishing:

```bash
npm run pack
```

This will output a `.zip` file you can upload to Framer.

## 🧠 Credits

Built by [@DeveloperAdityaa](https://github.com/DeveloperAdityaa) with love for the Framer & AI community.

## 📄 License

MIT © 2025 Aditya Singh

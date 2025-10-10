# Nemo Pad

A modern, freeform STEM notebook powered by NVIDIA Nemotron AI. Write equations, take notes, and get instant help from an AI assistant - all in a beautiful, flexible canvas interface.

[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js%2015-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Powered by NVIDIA](https://img.shields.io/badge/Powered%20by-NVIDIA%20Nemotron-76B900?style=for-the-badge&logo=nvidia)](https://www.nvidia.com/)

## ✨ Features

### 🎨 Freeform Canvas
- Drag and position blocks anywhere on your canvas
- Resize and scale content to your preference
- Infinite canvas with notebook line paper background
- Double-click anywhere to create new blocks

### 📝 Rich Content Blocks
- **Equation Blocks**: Write and render beautiful LaTeX equations with KaTeX
- **Text Blocks**: Rich markdown support with formatting
- **Todo Lists**: Track tasks and check off items
- Multi-line equation support with adjustable line spacing (even negative for overlapping lines!)

### 🤖 AI Assistant
- Powered by NVIDIA Nemotron Nano 9B-v2
- Real-time streaming responses
- Automatic LaTeX rendering in responses
- Context-aware based on your notebook content
- Perfect for explaining concepts, solving problems, and checking your work

### 🧠 Intelligent LaTeX Conversion
- Automatically converts natural language to LaTeX equations
- Smart detection - only converts when needed
- Preserves existing LaTeX syntax
- Re-converts broken LaTeX mixed with natural language
- Line-by-line validation for multi-line equations

### 📚 Multi-Notebook Management
- Create unlimited notebooks for different subjects
- Search and filter by title, subject, or description
- Sort by last modified, date created, or title
- Auto-save to local storage
- Each notebook maintains its own isolated state

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- NVIDIA API Key ([Get one here](https://build.nvidia.com/))

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/nemo-pad.git
cd nemo-pad
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create a `.env.local` file and add your NVIDIA API key:
\`\`\`env
NVIDIA_API_KEY=your_api_key_here
\`\`\`

4. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎯 Usage

### Creating Notebooks
1. Click "New Notebook" on the home page
2. Enter a title, subject, and description
3. Start adding blocks to your canvas

### Adding Content Blocks
- Click the toolbar buttons to add equation, text, or todo blocks
- Or double-click anywhere on the canvas to create an equation block
- Drag blocks to reposition them
- Resize blocks by dragging the bottom-right corner

### Writing Equations
1. Click on an equation block to enter edit mode
2. Type natural language (e.g., "x squared plus 2x") or LaTeX
3. Press Enter or click outside to render
4. For multi-line equations, press Enter between lines
5. Drag the top/bottom of equation blocks to adjust line spacing

### Using the AI Assistant
1. Click "Nemotron Assistant" to open the sidebar
2. Ask questions about STEM topics
3. The AI can see your current notebook content for context
4. All equations in responses are automatically rendered

## 🛠️ Technology Stack

- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS 4 with custom design system
- **Math Rendering**: KaTeX for beautiful LaTeX equations
- **AI**: NVIDIA Nemotron API (OpenAI SDK compatible)
- **UI Components**: Radix UI primitives
- **Fonts**: Inter, JetBrains Mono, Crimson Text
- **Storage**: LocalStorage for notebooks

## 🎨 Design Philosophy

Nemo Pad embraces a **freeform, paper-like experience** inspired by physical notebooks:
- No rigid structure - place content anywhere
- Clean, academic aesthetic with neutral grays and green accents
- Smooth drag interactions and animations
- Distraction-free writing environment

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License - feel free to use this project for your own purposes.

## 🙏 Acknowledgments

- Powered by [NVIDIA Nemotron](https://www.nvidia.com/en-us/ai-data-science/products/nemotron/) AI
- Built with [Next.js](https://nextjs.org/)
- Math rendering by [KaTeX](https://katex.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Built for the NVIDIA x Shortest AI Hackathon** 🚀

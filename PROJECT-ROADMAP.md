# Nemo Pad - Project Roadmap

> A comprehensive guide to completed features, current priorities, and future enhancements for the Nemo Pad STEM notebook application.

**Last Updated:** October 2025
**Status:** Active Development
**Built for:** NVIDIA x Shortest AI Hackathon

---

## 📊 Project Overview

### Vision
Create the ultimate digital STEM notebook that combines the freedom of paper with the power of AI - enabling students and professionals to write equations, take notes, run code, visualize data, and get instant AI assistance, all in one beautiful freeform canvas.

### Core Principles
- **Freeform & Flexible**: No rigid structure - place content anywhere
- **AI-Powered**: NVIDIA Nemotron assistant for real-time help
- **Beautiful Math**: Perfect LaTeX rendering with natural language input
- **Fast & Responsive**: Smooth interactions, auto-save, offline-first
- **Academic Aesthetic**: Clean design inspired by physical notebooks

---

## ✅ Completed Features

### Multi-Notebook System
- [x] Home page with notebook management
- [x] Create, read, update, delete notebooks
- [x] Search and filter by title, subject, description
- [x] Sort by last modified, date created, or title (A-Z)
- [x] Notebook cards with metadata display
- [x] Duplicate notebook functionality
- [x] Block count display per notebook

### Freeform Canvas
- [x] Infinite canvas with draggable blocks
- [x] Notebook line paper background (customizable)
- [x] Drag to reposition blocks anywhere
- [x] Resize blocks via bottom-right corner drag
- [x] Scale blocks (zoom in/out on individual blocks)
- [x] Double-click canvas to create new equation block
- [x] Smooth drag animations

### Content Blocks
- [x] **Equation Block**: LaTeX with natural language conversion
  - [x] Auto-convert "x squared" → x²
  - [x] Multi-line equation support
  - [x] Adjustable line spacing (even negative for overlap!)
  - [x] Smart detection - only convert when needed
  - [x] Preserve valid LaTeX
  - [x] Re-convert broken LaTeX
  - [x] Line-by-line validation
- [x] **Text Block**: Rich markdown support
  - [x] Bold, italic, code formatting
  - [x] Auto-delete empty text blocks
- [x] **Todo Block**: Task lists with checkboxes
  - [x] Add/remove items
  - [x] Check off completed tasks
  - [x] Persistent state

### AI Assistant
- [x] NVIDIA Nemotron Nano 9B-v2 integration
- [x] Resizable sidebar
- [x] Real-time streaming responses
- [x] Context-aware (reads current notebook)
- [x] Automatic LaTeX rendering in responses
  - [x] Display math blocks ($$...$$)
  - [x] Auto-wrap LaTeX commands
  - [x] Fix malformed fractions
  - [x] Clean up nested $ signs
- [x] System prompt optimized for STEM tutoring
- [x] Markdown formatting (bold, italic, code)

### Data Persistence
- [x] LocalStorage implementation
- [x] Auto-save on every change
- [x] Separate storage per notebook
- [x] Metadata tracking (created, updated timestamps)
- [x] Robust error handling

### UI/UX & Theming
- [x] **NVIDIA Green & Black Theme** - Fully implemented!
  - [x] Dark background (oklch 0.20 grey)
  - [x] NVIDIA Green (#76B900) primary accents
  - [x] Neutral grey color palette
  - [x] All components themed consistently
- [x] Crimson Text font for academic feel
- [x] Inter for body text, JetBrains Mono for code
- [x] Smooth animations and transitions
- [x] Responsive toolbar
- [x] Loading states
- [x] Empty states with helpful prompts
- [x] Notebook line paper background with green lines

---

## 🔥 Critical Priority (Next Sprint)

### 1. Multi-Select Blocks ⭐ NEW
**Goal:** Select and manipulate multiple blocks at once, like selecting files in Finder/Explorer

**Tasks:**
- [ ] Implement selection rectangle on canvas drag
- [ ] Click + drag on empty canvas to draw selection box
- [ ] Highlight selected blocks with border/glow
- [ ] Track selection state in canvas component
- [ ] Shift+click to add/remove blocks from selection
- [ ] Ctrl/Cmd+A to select all blocks
- [ ] Click empty area to deselect all
- [ ] Move selected blocks together (maintain relative positions)
- [ ] Delete multiple blocks at once (with confirmation)
- [ ] Copy/paste multiple blocks
- [ ] Keyboard shortcuts:
  - Arrow keys to move selection
  - Delete/Backspace to remove
  - Escape to deselect
- [ ] Selection indicator (e.g., "3 blocks selected")
- [ ] Right-click context menu for selection actions

**Technical Approach:**
\`\`\`typescript
// State
const [selectedBlocks, setSelectedBlocks] = useState<Set<string>>(new Set())
const [selectionBox, setSelectionBox] = useState<Rectangle | null>(null)

// On canvas mouse down/drag
// Calculate selection rectangle
// Find blocks within rectangle
// Update selectedBlocks state

// On move: apply same delta to all selected blocks
\`\`\`

### 2. Code Execution Block
**Goal:** Run Python code directly in notebooks (Pyodide already in dependencies!)

**Tasks:**
- [ ] Create CodeBlock component
- [ ] Integrate Monaco Editor (already in dependencies)
- [ ] Initialize Pyodide worker
- [ ] Execute Python code in sandbox
- [ ] Display output (stdout, stderr, images)
- [ ] Support common libraries (numpy, matplotlib, pandas)
- [ ] Add console for errors
- [ ] Syntax highlighting
- [ ] Code formatting (Prettier/Black)
- [ ] Share variables between code blocks
- [ ] Plot inline with matplotlib
- [ ] Export code to .py file

### 3. Export Functionality
**Goal:** Export notebooks to shareable formats

**Tasks:**
- [ ] Export to PDF
  - [ ] Render canvas to PDF with proper layout
  - [ ] Include all LaTeX equations
  - [ ] Preserve formatting
- [ ] Export to PNG/image
  - [ ] Capture canvas as high-res image
  - [ ] Include all visible blocks
- [ ] Export to Markdown
  - [ ] Convert blocks to markdown
  - [ ] Preserve LaTeX with $ delimiters
  - [ ] Include code blocks
- [ ] Export to JSON (notebook format)
- [ ] Import from JSON

### 4. Keyboard Shortcuts System
**Goal:** Power user productivity with keyboard shortcuts

**Tasks:**
- [ ] Create keyboard shortcuts manager
- [ ] Document all shortcuts
- [ ] Add shortcuts modal (press ?)
- [ ] Common shortcuts:
  - Ctrl/Cmd+N: New block
  - Ctrl/Cmd+D: Duplicate block
  - Ctrl/Cmd+K: Open AI assistant
  - Ctrl/Cmd+/: Toggle AI sidebar
  - Ctrl/Cmd+S: Force save (already auto-saves)
  - Ctrl/Cmd+Z: Undo
  - Ctrl/Cmd+Shift+Z: Redo
  - Delete/Backspace: Delete selected blocks
  - Arrow keys: Move selection
  - Tab: Focus next block
  - Shift+Tab: Focus previous block

---

## 🎯 High Priority

### 5. Graph & Chart Block
**Goal:** Visualize data with interactive charts (Plotly.js already in dependencies!)

**Tasks:**
- [ ] Create GraphBlock component
- [ ] Integrate Plotly.js
- [ ] Support chart types:
  - Line charts
  - Bar charts
  - Scatter plots
  - Histograms
  - Pie charts
  - 3D surface plots
- [ ] Data input methods:
  - Manual data entry (JSON/CSV)
  - Link to code block output
  - Import from CSV file
- [ ] Interactive features (zoom, pan, hover)
- [ ] Export chart as image
- [ ] Customize colors, labels, axes
- [ ] Multiple series support

### 6. Image Block
**Goal:** Add images to notebooks

**Tasks:**
- [ ] Create ImageBlock component
- [ ] Upload image from file
- [ ] Drag & drop image onto canvas
- [ ] Paste image from clipboard
- [ ] Resize image (maintain aspect ratio)
- [ ] Add captions/labels
- [ ] Support formats: PNG, JPG, SVG, GIF
- [ ] Compress large images
- [ ] Store in localStorage or external storage
- [ ] Image gallery/library

### 7. Calculator Block (From Existing TODO)
**Goal:** Interactive calculations and graphing

**Options:**
- [ ] **Option A: Desmos Integration**
  - Research Desmos API licensing
  - Embed Desmos graphing calculator
  - Sync expressions with notebook
- [ ] **Option B: Custom Implementation**
  - Use MathJS for calculations
  - Use Plotly for graphing
  - Build expression evaluator
  - Support functions, variables, equations

**Features:**
- [ ] Basic arithmetic
- [ ] Algebra (solve equations)
- [ ] Graphing functions (2D/3D)
- [ ] Statistics (mean, median, regression)
- [ ] Calculus (derivatives, integrals)
- [ ] Matrix operations
- [ ] Unit conversions

### 8. Mobile Responsiveness
**Tasks:**
- [ ] Test on mobile devices
- [ ] Touch-friendly drag interactions
- [ ] Responsive toolbar (hamburger menu)
- [ ] Mobile-optimized AI sidebar
- [ ] Virtual keyboard handling
- [ ] Pinch to zoom canvas
- [ ] Mobile-specific gestures
- [ ] PWA manifest for mobile install

### 9. Undo/Redo System
**Tasks:**
- [ ] Implement history stack
- [ ] Track all block changes
- [ ] Undo/redo for:
  - Block creation/deletion
  - Content changes
  - Position/size changes
- [ ] Keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z)
- [ ] Undo/redo buttons in toolbar
- [ ] History limit (e.g., last 50 actions)
- [ ] Persist history in localStorage

---

## 📋 Medium Priority

### 10. Backend & Cloud Storage (From Existing TODO)
**Goal:** Cloud sync, multi-device access, collaboration

**Tasks:**
- [ ] Design database schema (PostgreSQL/Supabase)
- [ ] Set up backend API (Next.js API routes or separate service)
- [ ] User authentication (NextAuth.js)
- [ ] Migrate from localStorage to database
- [ ] Implement sync logic (offline-first)
- [ ] Conflict resolution strategy
- [ ] Real-time collaboration (WebSockets)
- [ ] Share notebooks via link
- [ ] Permissions system (view/edit)

### 11. Block Templates & Library
**Tasks:**
- [ ] Create template system
- [ ] Pre-built block templates:
  - Common equations (quadratic formula, etc.)
  - Periodic table
  - Common graphs
  - Todo lists for subjects
  - Code snippets
- [ ] Template gallery/browser
- [ ] Save custom templates
- [ ] Share templates with community

### 12. Performance Optimizations
**Tasks:**
- [ ] Virtual rendering for large notebooks
- [ ] Lazy load AI assistant (code splitting)
- [ ] Optimize LaTeX rendering (cache results)
- [ ] Debounce auto-save
- [ ] Web Workers for heavy computations
- [ ] Reduce bundle size
- [ ] Lighthouse audit and fixes
- [ ] Memory leak detection

### 13. Testing Suite
**Tasks:**
- [ ] Set up Vitest
- [ ] Unit tests for:
  - Block components
  - LaTeX conversion logic
  - Storage utilities
  - AI integration
- [ ] Integration tests
- [ ] E2E tests with Playwright
- [ ] Visual regression tests
- [ ] Test coverage > 80%

### 14. Enhanced Documentation
**Tasks:**
- [ ] User guide/documentation site
- [ ] Video tutorials
- [ ] Keyboard shortcuts reference
- [ ] LaTeX syntax guide
- [ ] API documentation (if backend added)
- [ ] Contributing guide
- [ ] Architecture documentation
- [ ] Code comments and JSDoc

---

## 💡 Future Ideas (Backlog)

### Advanced Features
- [ ] Block linking/references (cite blocks in other blocks)
- [ ] Notebook templates by subject (Physics, Chemistry, CS)
- [ ] Version history/snapshots
- [ ] Search across all notebooks
- [ ] Tags and categories
- [ ] Notebook folders
- [ ] Starred/favorited notebooks
- [ ] Dark/light theme toggle
- [ ] Custom color themes per notebook
- [ ] Block animations and transitions
- [ ] LaTeX autocomplete
- [ ] Equation solver (show steps)
- [ ] Unit conversion tool
- [ ] Periodic table reference
- [ ] Formula library

### AI Enhancements
- [ ] Ask AI about specific blocks (not whole notebook)
- [ ] AI-generated problem sets
- [ ] AI checking work/solutions
- [ ] Voice input for AI assistant
- [ ] AI suggests related content
- [ ] Multi-language support (translate responses)

### Collaboration
- [ ] Real-time multiplayer editing
- [ ] Comments on blocks
- [ ] Mentions (@username)
- [ ] Activity feed
- [ ] Shared workspace/class
- [ ] Teacher/student roles
- [ ] Assignment system

### Integrations
- [ ] WolframAlpha API
- [ ] SymPy for symbolic math
- [ ] Desmos graphs embed
- [ ] YouTube video embeds
- [ ] Google Drive sync
- [ ] Notion import/export
- [ ] Obsidian compatibility

### Platform
- [ ] Desktop app (Electron/Tauri)
- [ ] VS Code extension
- [ ] Browser extension (clip content to notebook)
- [ ] Mobile app (React Native)
- [ ] API for third-party integrations

---

## 🐛 Known Issues & Bugs

### Critical
- None currently!

### Minor
- [ ] LaTeX rendering occasionally flickers during streaming
- [ ] Very long notebooks may have performance issues
- [ ] Mobile touch drag can be imprecise

### Edge Cases
- [ ] Handle storage quota exceeded
- [ ] Handle very large images
- [ ] Handle extremely long AI responses

---

## 🔧 Technical Debt

### Code Quality
- [ ] Add TypeScript strict mode
- [ ] Improve error boundaries
- [ ] Standardize component structure
- [ ] Extract magic numbers to constants
- [ ] Remove console.logs from production
- [ ] Add proper logging system

### Architecture
- [ ] Refactor block state management (consider Zustand/Redux)
- [ ] Create custom hooks library
- [ ] Standardize API calls with react-query
- [ ] Improve file structure organization
- [ ] Document component props with JSDoc

### Performance
- [ ] Audit and reduce re-renders
- [ ] Optimize localStorage reads/writes
- [ ] Reduce bundle size (tree-shaking)
- [ ] Add service worker for offline support

---

## 📈 Success Metrics

### User Engagement
- Number of notebooks created
- Average blocks per notebook
- AI assistant usage rate
- Session duration
- Return user rate

### Performance
- First contentful paint < 1s
- Time to interactive < 2s
- LaTeX render time < 100ms
- Auto-save latency < 50ms

### Quality
- Test coverage > 80%
- Zero critical bugs in production
- Lighthouse score > 90
- Bundle size < 500KB

---

## 🚀 Deployment Checklist

### Pre-Launch
- [ ] Environment variables configured
- [ ] Error tracking set up (Sentry)
- [ ] Analytics set up (Vercel Analytics)
- [ ] SEO optimization (meta tags, sitemap)
- [ ] README updated with deployment instructions
- [ ] License added
- [ ] Security audit
- [ ] Performance audit

### Launch
- [ ] Deploy to Vercel
- [ ] Set up custom domain
- [ ] Configure CDN/caching
- [ ] Monitor error rates
- [ ] Set up status page
- [ ] Create demo video
- [ ] Submit to product directories

### Post-Launch
- [ ] User feedback collection
- [ ] Bug triage and fixes
- [ ] Feature prioritization based on usage
- [ ] Marketing and outreach
- [ ] Community building

---

## 📅 Estimated Timeline

### Sprint 1 (Current - Week 1)
- Multi-select blocks
- Code execution block
- Export to PDF/PNG/Markdown

### Sprint 2 (Week 2)
- Keyboard shortcuts
- Graph/chart block
- Image block

### Sprint 3 (Week 3)
- Calculator block
- Mobile responsiveness
- Undo/redo

### Sprint 4 (Week 4+)
- Backend/cloud storage
- Testing suite
- Performance optimizations
- Documentation

---

## 🎓 Learning Resources

### Technologies Used
- [Next.js 15 Docs](https://nextjs.org/docs)
- [React 19 Docs](https://react.dev/)
- [KaTeX Documentation](https://katex.org/docs/api.html)
- [NVIDIA Nemotron API](https://build.nvidia.com/)
- [Pyodide Documentation](https://pyodide.org/)
- [Plotly.js Documentation](https://plotly.com/javascript/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)

---

**Last Updated:** October 10, 2025
**Maintained By:** Development Team
**Status:** 🟢 Active Development

# Ollama Desktop 

A lightweight, blazing-fast, and genuinely native macOS desktop experience for your locally installed Ollama models.

Built with **Next.js 16**, **React 19**, and **Tailwind CSS**, strictly engineered around Apple Human Interface Guidelines and the macOS design philosophy — delivering the elegance of cloud-based AI platforms (such as ChatGPT, Gemini, and Claude) while keeping your data 100% private, local, and offline on your machine.

---

## ✨ Features

###  Native macOS UI & Polish
* **Authentic Window Chrome:** Flush-left traffic lights (`#FF5F57`, `#FEBC2E`, `#28C840`) with micro-animated hover glyphs (`×`, `−`, `+`), inactive window state detection, and a clean ~52px draggable title bar.
* **Apple Typography & Materials:** System font stack (`-apple-system, SF Pro Text, SF Pro Display`), monospace (`SF Mono, Menlo`), and authentic vibrancy blur (`backdrop-filter: saturate(180%) blur(20px)`).
* **Layered Elevation & Depth:** Subtle `0 0 0 0.5px` border definition paired with soft spread shadows.
* **Independent Light & Dark Modes:** Handcrafted color palettes for both modes respecting Apple's contrast ratios — switchable via system preference or manual toggle.
* **Window Presentation Modes:** Choose between full-bleed native window view or a floating windowed desktop frame with backdrop depth.

### ⚡ Local Ollama Integration & Model Discovery
* **Zero-Config Discovery:** Automatically queries your local Ollama daemon (`http://127.0.0.1:11434`), lists installed models, and displays parameter sizes (e.g., `7.6B`), quantization levels (`Q4_K_M`), context lengths (`32k`), and multimodal capabilities.
* **Low-Latency Streaming:** Direct token streaming from Ollama via Web `ReadableStream` route handlers.
* **Live Performance Metrics:** Real-time generation velocity (e.g. `⚡ 34.2 tokens/s`), token evaluation count, and total response duration displayed on every assistant response.
* **Live Status Indicator:** Real-time connection badge in the title bar (green pulse when connected, amber/red with one-click reconnect and troubleshooting tips when offline).

### 💬 Multi-Threaded Conversation Management
* **Temporal Grouping:** Conversations are automatically organized into **Pinned**, **Today**, **Yesterday**, **Previous 7 Days**, and **Older**.
* **Instant Management:** Inline rename on double-click, pin/unpin to top, real-time search filtering, and deletion with confirmation toasts.
* **Data Portability:** One-click export of any conversation as formatted Markdown (`.md`), plus full JSON backup export and restore.

### 📄 Intelligent Document & PDF Processing
* **Local PDF Extraction:** Integrated with `unpdf` to extract clean, page-delimited text from PDFs directly on your machine without heavy binary or canvas dependencies.
* **Broad Format Support:** Drag and drop or upload PDFs, Markdown (`.md`), plain text (`.txt`), CSV, JSON, and source code (`.ts`, `.py`, `.js`, `.go`, `.rs`, `.cpp`, `.html`, `.css`, etc.).
* **Slide-Out Detail Inspector:** Click any attached document pill in the conversation to open a native macOS slide-out panel from the right to review the extracted text context and copy it with one click.
* **Multimodal Vision Handling:** Automatically formats and passes base64 image data to vision-capable models (e.g., `llama3.2-vision`, `llava`, `minicpm-v`). If an image is attached to a text-only model (like `qwen2.5-coder`), a proactive macOS advisory callout informs you and recommends a vision model.
* **Drag-and-Drop:** Drag and drop any document, PDF, or image anywhere onto the application window with visual accent border feedback.

### ⌨️ Spotlight Command Palette & Keyboard Navigation
* **Raycast / Spotlight Palette (<kbd>⌘K</kbd>):** Instant search across all conversations, switch active models on the fly, toggle themes, or run actions with arrow-key navigation.
* **Preferences Window (<kbd>⌘,</kbd>):** Apple-style segmented tabs to customize Ollama endpoints, default models, temperature slider (0.0 to 1.5), system prompts, and themes.
* **Keyboard Shortcuts Cheat Sheet (<kbd>⌘/</kbd>):** Quick-reference modal displaying all native shortcuts formatted with `<kbd>` tags.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>⌘</kbd> <kbd>N</kbd> | New Conversation |
| <kbd>⌘</kbd> <kbd>K</kbd> | Spotlight Command Palette & Quick Actions |
| <kbd>⌘</kbd> <kbd>B</kbd> | Toggle Sidebar |
| <kbd>⌘</kbd> <kbd>,</kbd> | Preferences & Ollama Configuration |
| <kbd>⌘</kbd> <kbd>/</kbd> | Keyboard Shortcuts Sheet |
| <kbd>⌘</kbd> <kbd>F</kbd> | Search Conversations |
| <kbd>↵</kbd> | Send Message |
| <kbd>⇧</kbd> <kbd>↵</kbd> | Insert Line Break |
| <kbd>Esc</kbd> | Dismiss modals / slideouts, or halt active streaming |

---

## 🏗️ Architecture & Technology Stack

```
ollama-desktop/
├── app/
│   ├── api/
│   │   ├── ollama/
│   │   │   ├── chat/route.ts      # Streaming chat completion proxy
│   │   │   └── status/route.ts    # Ollama health check & model discovery
│   │   └── process-file/route.ts  # PDF (unpdf), document & image processor
│   ├── globals.css                # macOS CSS variables, typography, and vibrancy
│   ├── layout.tsx                 # Root layout with Apple viewport settings
│   └── page.tsx                   # Main desktop window container
├── components/
│   ├── chat/
│   │   ├── ChatContainer.tsx      # Main chat view & model switcher toolbar
│   │   ├── ChatInput.tsx          # Floating input box, attachment tray & drag-and-drop
│   │   ├── ChatMessageItem.tsx    # Markdown rendering, code blocks, stats & pills
│   │   ├── CodeBlock.tsx          # Monospace syntax block with copy feedback
│   │   └── EmptyState.tsx         # Clean starter state with model specs & suggestions
│   ├── command-palette/
│   │   └── CommandPalette.tsx     # Spotlight-style quick switcher (⌘K)
│   ├── modals/
│   │   ├── ImageLightbox.tsx      # Full-resolution image preview modal
│   │   ├── SettingsModal.tsx      # Segmented Preferences window (⌘,)
│   │   └── ShortcutsModal.tsx     # Keyboard shortcuts cheat sheet (⌘/)
│   ├── preview/
│   │   └── DocumentSlideout.tsx   # Native slide-out panel for extracted text
│   ├── sidebar/
│   │   └── Sidebar.tsx            # Grouped conversation sidebar
│   ├── ui/
│   │   └── Toast.tsx              # Lightweight optimistic UI toasts
│   └── window/
│       └── WindowChrome.tsx       # Traffic lights, title bar drag zone & status pill
├── context/
│   └── ChatContext.tsx            # Global state (streaming, multi-chats, settings)
├── lib/
│   └── storage.ts                 # Persistent localStorage & JSON backup/restore
└── types/
    └── chat.ts                    # TypeScript definitions
```

* **Framework:** Next.js 16 (App Router + Turbopack)
* **UI Library:** React 19
* **Styling:** Tailwind CSS v4 + Apple Design System CSS Variables
* **PDF Extraction:** `unpdf` (Zero-dependency, isomorphic PDF text extraction)
* **Markdown Rendering:** `react-markdown` + `remark-gfm`
* **Icons:** `lucide-react` (configured in SF Symbols monoline stroke style)

---

## 🚀 Getting Started

### Prerequisites

1. **Node.js** (v18.18+ or v20+) and **pnpm** (or npm/yarn).
2. **Ollama** installed and running on your Mac:
   ```bash
   # Verify Ollama is running
   ollama list
   ```
   If Ollama is not running, start it:
   ```bash
   ollama serve
   ```
3. Pull your favorite model(s) if you haven't already:
   ```bash
   # Code & general reasoning
   ollama pull qwen2.5-coder:7b
   
   # Multimodal vision (optional)
   ollama pull llama3.2-vision
   ```

### Installation & Launch

1. Clone or open the repository:
   ```bash
   cd ollama-desktop
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Open your browser or native webview wrapper:
   ```
   http://localhost:3000
   ```

### Production Build

To verify and run an optimized production build:
```bash
pnpm build
pnpm start
```

---

## ⚙️ Configuration

Open **Preferences** via <kbd>⌘,</kbd> or the gear icon in the title bar to configure:
* **Ollama Host URL:** Default is `http://127.0.0.1:11434`. Supports custom remote or local ports.
* **Default Model:** Pre-select your preferred model for new conversations.
* **Temperature:** Fine-tune creativity vs. deterministic coding output (from `0.00` to `1.50`).
* **System Prompt:** Global persona and guidelines injected into queries.
* **Appearance:** Toggle between **System**, **Light**, or **Dark** mode, and switch between **Full Viewport** or **Windowed Desktop Frame**.

---

## 🔒 Privacy & Local Execution

* All chat completions, document processing, and PDF extractions occur **100% locally** on your machine.
* No external API keys, telemetry, or third-party cloud services are used.
* Conversations and preferences are persisted strictly in your browser's local sandbox storage.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

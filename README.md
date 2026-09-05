# zenvor-ai

An offline-first, full-stack AI execution hub designed to run quantized `.gguf` language models locally with GPU acceleration, persistent semantic vector memory, live web search grounding, and a modern Next.js workspace[cite: 1].

---

## Features

* **Local Inference:** Directly executes `.gguf` models on your machine using `llama-cpp-python` with optional CPU fallback[cite: 1].
* **GPU Hardware Offloading:** Configurable GPU layer offloading (`n_gpu_layers`) with NVIDIA CUDA compilation support[cite: 1].
* **Real-Time Web Grounding:** Hybrid web search pipeline combining Tavily Search API and DuckDuckGo fallback[cite: 1].
* **Deep Content Scraping:** Uses `trafilatura` to extract clean article text and strips web boilerplates and ads[cite: 1].
* **YouTube Channel Grounding:** Native channel inspection and recent video extraction powered by `yt-dlp`[cite: 1].
* **Persistent Vector Memory:** Long-term conversation recall across sessions backed by ChromaDB and `all-MiniLM-L6-v2` embeddings[cite: 1].
* **Real-Time SSE Streaming:** Server-Sent Events (SSE) streaming delivering real-time tokens, status indicators, and reasoning logs[cite: 1].
* **Prompt Branching & Versioning:** Edit previous prompts in-place and navigate across multiple response versions[cite: 1].
* **Session Management:** Pinned threads, background automated session titling, and batch conversation deletion backed by SQLite[cite: 1].
* **Polished Developer Workspace:** Modern Next.js 14 interface styled with Tailwind CSS, custom JetBrains Mono typography, syntax highlighting, and dark/light modes[cite: 1].

---

## Tech Stack

### Backend
* **Runtime & Framework:** Python 3.10+, FastAPI, Uvicorn[cite: 1]
* **LLM Engine:** `llama-cpp-python` (`GGML_CUDA` support)[cite: 1]
* **Vector Database:** ChromaDB with `sentence-transformers` (`all-MiniLM-L6-v2`)[cite: 1]
* **Search & Crawling:** `tavily-python`, `duckduckgo-search`, `trafilatura`, `yt-dlp`[cite: 1]
* **Database & ORM:** SQLite, SQLAlchemy[cite: 1]
* **Streaming Protocol:** `sse-starlette` (Server-Sent Events)[cite: 1]

### Frontend
* **Framework:** Next.js 14 (App Router)[cite: 1]
* **UI & Styling:** React 18, Tailwind CSS, Framer Motion, Lucide React[cite: 1]
* **Typography:** JetBrains Mono[cite: 1]
* **Markdown & Code:** `react-markdown`, `remark-gfm`, `react-syntax-highlighter`[cite: 1]

---

## Repository Structure

```text
zenvor-ai/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes_chat.py         # Streaming inference & search grounding[cite: 1]
│   │   │   ├── routes_history.py      # Session and message CRUD operations[cite: 1]
│   │   │   └── routes_models.py       # Model scanning and dynamic loading[cite: 1]
│   │   ├── core/
│   │   │   ├── config.py              # Directory paths and model defaults[cite: 1]
│   │   │   └── database.py            # SQLite engine, models, and migrations[cite: 1]
│   │   ├── services/
│   │   │   ├── deep_search_engine.py  # DuckDuckGo, Tavily, yt-dlp & Trafilatura[cite: 1]
│   │   │   ├── memory_engine.py       # ChromaDB vector persistence[cite: 1]
│   │   │   └── model_engine.py        # llama-cpp-python wrapper and thread locks[cite: 1]
│   │   └── main.py                    # FastAPI initialization and lifespan setup[cite: 1]
│   ├── models/                        # Local directory for .gguf model weights[cite: 1]
│   ├── memory_db/                     # ChromaDB persistent storage directory[cite: 1]
│   ├── history.db                     # SQLite chat history database[cite: 1]
│   ├── requirements.txt               # Python package dependencies[cite: 1]
│   └── run.py                         # Backend server entrypoint[cite: 1]
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── c/[id]/page.tsx        # Conversation workspace route[cite: 1]
    │   │   ├── globals.css            # JetBrains Mono font faces and theme vars[cite: 1]
    │   │   ├── layout.tsx             # Root layout and theme hydration script[cite: 1]
    │   │   └── page.tsx               # Home landing page[cite: 1]
    │   ├── components/
    │   │   ├── ChatBubble.tsx         # Message bubbles, version control & markdown[cite: 1]
    │   │   ├── CodeBlock.tsx          # Syntax highlighted code snippets with copy button[cite: 1]
    │   │   ├── HomeHero.tsx           # Initial prompt input, toggles & prompt pills[cite: 1]
    │   │   ├── ModelSelector.tsx      # Dropdown to inspect and switch active models[cite: 1]
    │   │   ├── SearchBadge.tsx        # Citations display for external web sources[cite: 1]
    │   │   ├── SettingsModal.tsx      # Temperature, GPU layers & context window modal[cite: 1]
    │   │   ├── SidebarHistory.tsx     # Pinned threads, search history & multi-delete[cite: 1]
    │   │   ├── ThemeToggle.tsx        # Dark and light theme switcher[cite: 1]
    │   │   ├── ThinkingBlock.tsx      # Collapsible reasoning and research steps[cite: 1]
    │   │   └── Workspace.tsx          # Chat orchestrator and event loop handler[cite: 1]
    │   ├── hooks/
    │   │   └── useStreamingChat.ts    # SSE stream reader and turn state management[cite: 1]
    │   └── lib/
    │       ├── api.ts                 # REST client for backend endpoints[cite: 1]
    │       └── utils.ts               # Tailwind class merge helper[cite: 1]
    ├── public/fonts/                  # JetBrains Mono TTF and WOFF2 assets[cite: 1]
    ├── package.json                   # Node dependencies and build scripts[cite: 1]
    ├── tailwind.config.ts             # Tailwind dark mode and color scheme configs[cite: 1]
    └── tsconfig.json                  # TypeScript compiler settings[cite: 1]
```

---

## Prerequisites

* **Node.js**: `v18.17.0` or later[cite: 1]
* **Python**: `3.10` or later[cite: 1]
* **C/C++ Build Tools**: 
  * Windows: Visual Studio Build Tools with C++ desktop development[cite: 1]
  * Linux: `build-essential` / GCC[cite: 1]
  * macOS: Xcode Command Line Tools[cite: 1]
* *(Optional)* **NVIDIA CUDA Toolkit**: Required for hardware GPU layer offloading[cite: 1]

---

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/zenvor-ai.git
cd zenvor-ai
```

### 2. Backend Setup

Navigate to the `backend` directory and configure the Python environment:

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows (cmd/PowerShell):
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate
```

#### Install `llama-cpp-python`

* **For NVIDIA GPU (CUDA Acceleration):**
  ```bash
  CMAKE_ARGS="-DGGML_CUDA=on" pip install llama-cpp-python
  ```[cite: 1]

* **For CPU Only:**
  ```bash
  pip install llama-cpp-python
  ```[cite: 1]

#### Install Remaining Dependencies
```bash
pip install -r requirements.txt
```[cite: 1]

#### Configure Environment Variables
Create a `.env` file inside the `backend` directory:

```env
# Optional: Provide your Tavily API key for search grounding
TAVILY_API_KEY=your_tavily_api_key_here

# Optional: Override runtime inference defaults
DEFAULT_N_CTX=4096
DEFAULT_N_GPU_LAYERS=-1
DEFAULT_TEMPERATURE=0.7
DEFAULT_TOP_P=0.9
```[cite: 1]

#### Add GGUF Models
Place one or more `.gguf` model files into `backend/models/`:
```bash
# Example
backend/models/DeepSeek-R1-Distill-Qwen-7B-Q4_K_M.gguf
```[cite: 1]

#### Start Backend Server
```bash
python run.py
```[cite: 1]
The backend API server will initialize at `http://localhost:8000`[cite: 1].

---

### 3. Frontend Setup

In a new terminal window, navigate to the `frontend` directory:

```bash
cd frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```[cite: 1]

Open `http://localhost:3000` in your web browser[cite: 1].

---

## API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Returns service health status and currently loaded model[cite: 1]. |
| `GET` | `/api/models` | Lists all `.gguf` models located in `backend/models/`[cite: 1]. |
| `POST` | `/api/models/load` | Dynamically loads a model into memory with custom GPU layers and context[cite: 1]. |
| `POST` | `/api/chat/stream` | Server-Sent Events endpoint for real-time inference, memory recall, and search[cite: 1]. |
| `GET` | `/api/history/sessions` | Retrieves saved chat sessions sorted by pinned status and timestamp[cite: 1]. |
| `POST` | `/api/history/sessions` | Creates or initializes a new chat session[cite: 1]. |
| `PATCH` | `/api/history/sessions/{id}` | Updates session title or toggles pinned state[cite: 1]. |
| `DELETE` | `/api/history/sessions/{id}` | Deletes an individual chat session and associated messages[cite: 1]. |
| `POST` | `/api/history/sessions/batch-delete` | Deletes multiple chat sessions in a single transaction[cite: 1]. |
| `GET` | `/api/history/sessions/{id}/messages` | Fetches complete message history and metadata for a session[cite: 1]. |

---

## Configuration & Hyperparameters

You can tune model inference dynamically via the settings slider inside the UI or through the backend settings[cite: 1]:

* **Temperature (`0.1 - 1.5`):** Adjusts generation randomness (lower values produce more deterministic responses)[cite: 1].
* **GPU Offload Layers (`n_gpu_layers`):** Defines how many layers are offloaded into VRAM (`-1` attempts to offload all layers)[cite: 1].
* **Context Window Tokens (`n_ctx`):** Sets the context length (`2048`, `4096`, `8192`, or `16384`)[cite: 1].
* **Search Toggle:** Enables automated search grounding via Tavily or DuckDuckGo[cite: 1].
* **Memory Toggle:** Enables semantic context retrieval and persistence via ChromaDB[cite: 1].

---

## License

This project is licensed under a **Source-Available Non-Commercial License**. Free for personal, academic, and educational use. For commercial use, enterprise deployment, or monetization, please contact the author to purchase a commercial license — see the [LICENSE](LICENSE) file for complete details.

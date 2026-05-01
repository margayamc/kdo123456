# DeepSeek Code Agent Pro

A professional-grade Chrome browser extension and local Node.js server that enables saving code blocks from DeepSeek AI responses directly to your local codebase, with intelligent file naming and error correction powered by the Nvidia API.

## ✨ Features

- **💾 Smart Save Buttons**: Beautifully styled buttons automatically injected into every code block
- **📂 Read File Feature**: Load local files into chat for context-aware conversations
- **🔖 FILE Annotations**: Support for `// FILE: path/to/file.ext` annotations (JS, Python, HTML, SQL styles)
- **🤖 AI-Powered Auto-Save**: Uses Nvidia API (google/gemma-3n-e4b-it) for:
  - Intelligent file path determination
  - Automatic syntax error detection and correction
  - Project structure awareness
- **🎨 Modern UI**: Gradient buttons, toast notifications, loading states, success indicators
- **🔒 Enterprise Security**: 
  - Directory traversal protection
  - File extension validation
  - Request size limits
  - CORS configuration
- **📊 Real-time Monitoring**: Server health checks, status indicators, detailed logging
- **⚡ High Performance**: Debounced scanning, efficient DOM observation, request timeouts
- **🆓 Free to Use**: Only requires a free Nvidia API key (no paid APIs)

## 🏗️ Architecture

```
┌─────────────────────────┐     ┌──────────────────────┐     ┌─────────────────────┐
│  Chrome Extension       │────▶│  Local Server        │────▶│  Nvidia API         │
│  (chat.deepseek.com)    │     │  (localhost:4000)    │     │  (gemma-3n-e4b-it)  │
└─────────────────────────┘     └──────────────────────┘     └─────────────────────┘
         │                                │
         │                                ▼
         │                         ┌─────────────────────┐
         │                         │  Your Codebase      │
         │                         │  (CODABASE_PATH)    │
         │                         └─────────────────────┘
         ▼
┌─────────────────────────┐
│  DeepSeek Chat          │
│  AI Responses           │
└─────────────────────────┘
```

## 📋 Prerequisites

1. **Node.js** (v16 or higher)
2. **Chrome Browser** (or any Chromium-based browser)
3. **Nvidia API Key** - Get a free key from [Nvidia NIM](https://build.nvidia.com/)

## 🚀 Installation

### 1. Install Server Dependencies

```bash
cd local-server
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in `local-server/` or set environment variables:

```bash
# Required: Root directory where code will be saved
export CODABASE_PATH=/path/to/your/project

# Required: Get from https://build.nvidia.com/
export NVIDIA_API_KEY=nvapi-your-key-here

# Optional: Server port (default: 4000)
export PORT=4000

# Optional: Logging level (debug, info, warn, error)
export LOG_LEVEL=info
```

**Important**: 
- `CODABASE_PATH` must be an existing writable directory
- `NVIDIA_API_KEY` is required for auto-save (explicit saves work without it)

### 3. Start the Server

```bash
cd local-server
npm start
```

You should see:
```
✅ Server is running!
   url: http://localhost:4000
   healthCheck: http://localhost:4000/health
```

### 4. Install the Chrome Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `deepseek-code-agent-extension/` folder
5. The extension icon should appear in your toolbar

## 💡 Usage

### Saving Code with FILE Annotations

When DeepSeek generates code with annotations:

````python
# FILE: src/utils/helpers.py
def calculate_total(items):
    return sum(item.price for item in items)
````

The code is **automatically saved** to `src/utils/helpers.py` with a ✅ indicator.

**Supported annotation styles:**
- JavaScript: `// FILE: path/to/file.js`
- Python: `# FILE: path/to/file.py`
- HTML: `<!-- FILE: path/to/file.html -->`
- SQL: `-- FILE: path/to/file.sql`
- Markdown: `**FILE: path/to/file.md**`

### Saving Code Without Annotations

1. Hover over any code block in DeepSeek's response
2. Click the **💾 Save** button that appears
3. The server calls Nvidia AI to:
   - Determine optimal file path
   - Fix any syntax errors
4. A toast notification shows the saved path
5. Button turns green with ✅

### Reading Files into Chat

1. Click **📂 Read File** button near chat input
2. Enter relative file path (e.g., `src/main.py`)
3. File content is inserted into chat input
4. Send to DeepSeek for analysis/modification

### Server Status Indicator

- 🟢 Green dot = Server connected
- 🔴 Red dot = Server disconnected
- Click 🔄 to refresh connection

## 🔌 API Reference

### `GET /health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "codebasePath": "/path/to/project",
  "version": "2.0.0",
  "uptime": 123.456
}
```

### `POST /save`

Save code to explicit file path.

**Request:**
```json
{
  "filepath": "src/api/routes.py",
  "content": "from flask import Flask\napp = Flask(__name__)"
}
```

**Response:**
```json
{
  "ok": true,
  "path": "src/api/routes.py",
  "absolutePath": "/path/to/project/src/api/routes.py",
  "size": 45
}
```

### `GET /read?filepath=...`

Read file content.

**Request:**
```
GET /read?filepath=src%2Fapi%2Froutes.py
```

**Response:**
```json
{
  "content": "from flask import Flask\napp = Flask(__name__)",
  "path": "src/api/routes.py",
  "size": 45
}
```

### `POST /auto-save`

AI-powered save with automatic path determination.

**Request:**
```json
{
  "code": "def hello(): print('world')",
  "language": "python"
}
```

**Response:**
```json
{
  "ok": true,
  "path": "src/hello.py",
  "absolutePath": "/path/to/project/src/hello.py",
  "corrected": false,
  "source": "nvidia-api"
}
```

### `GET /list?dir=...`

List directory contents.

**Request:**
```
GET /list?dir=src
```

**Response:**
```json
{
  "contents": [
    { "name": "api", "isDirectory": true, "isFile": false, "isSymlink": false },
    { "name": "main.py", "isDirectory": false, "isFile": true, "isSymlink": false }
  ],
  "path": "src",
  "total": 2
}
```

## 🛡️ Security Features

1. **Directory Traversal Prevention**: All paths validated to stay within `CODABASE_PATH`
2. **File Extension Validation**: Blocks executable files (.exe, .dll, .so, etc.)
3. **Request Size Limits**: Maximum 10MB per request
4. **CORS Protection**: Only allows requests from extension and localhost
5. **Input Validation**: Strict type checking on all inputs
6. **Error Handling**: Graceful degradation with fallback mechanisms

## 🐛 Troubleshooting

### Server Won't Start

```bash
# Check if CODABASE_PATH exists
echo $CODABASE_PATH
ls -la $CODABASE_PATH

# Check if port 4000 is in use
lsof -i :4000

# Run with debug logging
LOG_LEVEL=debug npm start
```

### Extension Buttons Not Appearing

1. Refresh the DeepSeek chat page (F5)
2. Check browser console (F12) for errors
3. Verify extension is enabled at `chrome://extensions/`
4. Ensure you're on `https://chat.deepseek.com/*`

### Auto-Save Fails

1. Check server logs for Nvidia API errors
2. Verify API key is valid: `echo $NVIDIA_API_KEY`
3. Test API connectivity:
   ```bash
   curl -X POST https://integrate.api.nvidia.com/v1/chat/completions \
     -H "Authorization: Bearer $NVIDIA_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model":"google/gemma-3n-e4b-it","messages":[{"role":"user","content":"test"}]}'
   ```
4. Server will fallback to generic paths if AI fails

### Files Not Being Saved

1. Ensure `CODABASE_PATH` is writable: `touch $CODABASE_PATH/test.txt`
2. Check disk space: `df -h`
3. Verify no permission issues: `ls -la $CODABASE_PATH`

## 🌍 Supported Languages

The extension supports 40+ languages including:

| Language | Extensions | Typical Paths |
|----------|-----------|---------------|
| Python | .py | src/, tests/, utils/ |
| JavaScript | .js, .mjs | src/, components/, utils/ |
| TypeScript | .ts, .tsx | src/, components/, types/ |
| Java | .java | src/main/java/ |
| Go | .go | cmd/, pkg/, internal/ |
| Rust | .rs | src/, bin/ |
| Ruby | .rb | app/, lib/, spec/ |
| PHP | .php | src/, app/, public/ |
| HTML/CSS | .html, .css, .scss | templates/, styles/ |
| SQL | .sql | migrations/, queries/ |
| Shell | .sh, .bash | scripts/, bin/ |
| And more... | .json, .yaml, .md, .xml, etc. | config/, docs/ |

## 📝 Example Workflow

1. **User prompts DeepSeek**: "Create a Flask API with /hello endpoint"

2. **DeepSeek responds** with annotated code:
   ```python
   # FILE: app/main.py
   from flask import Flask
   app = Flask(__name__)
   
   @app.route('/hello')
   def hello():
       return "Hello, World!"
   ```

3. **Extension auto-saves** to `app/main.py` ✅

4. **User clicks "💾 Save"** on another block without annotation

5. **Server calls Nvidia AI**, which suggests `app/routes.py` and saves it

6. **User clicks "📂 Read File"**, loads `app/main.py`, and asks DeepSeek: "Add authentication to this code"

## 🔧 Development

### Extension Structure

```
deepseek-code-agent-extension/
├── manifest.json       # Extension configuration
├── content.js          # Main script (DOM manipulation)
├── background.js       # Service worker (notifications)
└── icons/              # Extension icons
```

### Server Structure

```
local-server/
├── package.json        # Dependencies
├── server.js           # Main server code
└── .env                # Environment variables (create this)
```

### Testing Locally

```bash
# Terminal 1: Start server
cd local-server
npm install
export CODABASE_PATH=/tmp/test-project
export NVIDIA_API_KEY=your-key
npm start

# Terminal 2: Test endpoints
curl http://localhost:4000/health
curl -X POST http://localhost:4000/save \
  -H "Content-Type: application/json" \
  -d '{"filepath":"test.py","content":"print(1)"}'
```

## 📄 License

MIT License - Feel free to use, modify, and distribute.

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 🙏 Acknowledgments

- DeepSeek for providing excellent AI coding assistance
- Nvidia for the free API tier via NIM platform
- Google for Gemma models
- Express.js community

---

**Made with ❤️ for developers who love efficiency**

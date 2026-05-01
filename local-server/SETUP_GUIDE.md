# DeepSeek Code Agent - Setup Guide

## 🚀 Quick Start Guide

### Step 1: Get Your Nvidia API Key (FREE)

1. **Visit**: https://build.nvidia.com/
2. **Sign Up**: Create a free account (you get free credits to start)
3. **Get API Key**: 
   - Go to your Dashboard
   - Click on "API Keys" or "Generate Key"
   - Copy your API key (starts with `nvapi-...`)

### Step 2: Configure the Server

1. **Open the `.env` file** in the `local-server` folder:
   ```
   local-server/.env
   ```

2. **Update these values**:
   ```env
   # Your project folder path (where code will be saved)
   CODABASE_PATH=/your/actual/project/path
   
   # Your Nvidia API key from Step 1
   NVIDIA_API_KEY=nvapi-your-actual-key-here
   ```

   **For Windows users** (use forward slashes or double backslashes):
   ```env
   CODABASE_PATH=D:/Work/Web_Development/shoot/kdo123456
   # OR
   CODABASE_PATH=D:\\Work\\Web_Development\\shoot\\kdo123456
   ```

   **For Linux/Mac users**:
   ```env
   CODABASE_PATH=/home/username/my-project
   # OR
   CODABASE_PATH=~/my-project
   ```

### Step 3: Install Dependencies

```bash
cd local-server
npm install
```

### Step 4: Start the Server

```bash
npm start
```

You should see:
```
Codebase Path: /your/project/path
Starting DeepSeek Code Agent Server...
Server running on http://localhost:4000
✅ Server is ready!
```

### Step 5: Load the Chrome Extension

1. Open Chrome and go to: `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `deepseek-code-agent-extension` folder
5. You should see the extension loaded ✅

### Step 6: Test It!

1. Go to https://chat.deepseek.com/
2. Look for the **"📂 Read File"** button near the chat input
3. Try asking DeepSeek to create some code
4. You should see **"💾 Save"** buttons on code blocks!

---

## 🔧 Troubleshooting

### Error: "CODABASE_PATH environment variable is required"
- Make sure the `.env` file exists in the `local-server` folder
- Check that `CODABASE_PATH` is set correctly
- Restart the server after changing the `.env` file

### Error: "NVIDIA_API_KEY environment variable is required"
- Get your API key from https://build.nvidia.com/
- Add it to the `.env` file: `NVIDIA_API_KEY=nvapi-your-key`
- Restart the server

### Error: "CODABASE_PATH does not exist"
- Create the folder: `mkdir -p /your/project/path`
- Or update `.env` to point to an existing folder

### Extension buttons not showing
- Refresh the DeepSeek chat page
- Make sure the extension is enabled in `chrome://extensions/`
- Check the browser console for errors (F12 → Console)

### Server won't start
- Make sure port 4000 is not in use
- Try changing the PORT in `.env` to another number (e.g., 4001)

---

## 📝 Example .env File

```env
# Project root directory
CODABASE_PATH=/workspace/my-project

# Nvidia API Key (get free key from https://build.nvidia.com/)
NVIDIA_API_KEY=nvapi-xxxxxxxxxxxxxxxxxxxx

# Server port
PORT=4000
```

---

## 🎯 How to Use

### Auto-Save with Annotations
When DeepSeek returns code with file annotations:
```python
// FILE: src/hello.py
def hello():
    print("Hello, World!")
```
The file will be saved automatically! ✅

### Manual Save
Click the **"💾 Save"** button on any code block. The AI will:
1. Suggest the best filename
2. Fix any syntax errors
3. Save to your project

### Read Files
Click **"📂 Read File"**, enter a path like `src/app.js`, and the file content will be loaded into your chat!

---

## 🔗 Useful Links

- **Nvidia API Console**: https://build.nvidia.com/
- **DeepSeek Chat**: https://chat.deepseek.com/
- **Model Info**: google/gemma-3n-e4b-it

---

## 💡 Tips

1. **Free Tier**: Nvidia offers free credits for new users
2. **Security**: Never commit your `.env` file to Git (it's in .gitignore)
3. **Performance**: Keep your project folder organized for better file suggestions
4. **Backup**: The server creates intermediate directories automatically

Happy Coding! 🚀

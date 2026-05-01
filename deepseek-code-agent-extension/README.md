# DeepSeek Code Agent Pro - GUI Extension

A professional browser extension with a beautiful GUI for saving code blocks from DeepSeek Chat.

## ✨ Features

### Modern Popup Interface
- **Server Status Indicator**: Real-time connection status to your local server
- **Quick Actions**: One-click access to save code, read files, settings, and help
- **Recent Files**: View and access your recently saved files with file type icons
- **Statistics Dashboard**: Track total files saved, today's saves, and auto-corrected files
- **Responsive Design**: Clean, modern UI with smooth animations and transitions

### Core Functionality
- 💾 **Auto-save code blocks** from DeepSeek Chat with AI-powered file naming
- 🔍 **Read files** directly from your local server
- 📊 **Track statistics** of your saved files
- 🕐 **Recent files history** with timestamps
- ✅ **Syntax error correction** via Nvidia API
- 📝 **FILE annotation support** for explicit file paths

## 📁 Extension Structure

```
deepseek-code-agent-extension/
├── manifest.json      # Extension configuration (Manifest V3)
├── background.js      # Service worker for notifications
├── content.js         # Content script for DeepSeek integration
├── popup.html         # Main popup GUI structure
├── popup.css          # Beautiful modern styling
├── popup.js           # Popup interactivity and logic
├── README.md          # This file
└── icons/
    ├── icon16.png     # 16x16 extension icon
    ├── icon48.png     # 48x48 extension icon
    └── icon128.png    # 128x128 extension icon
```

## 🚀 Installation

1. **Load the Extension**:
   - Open Chrome/Edge and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked"
   - Select the `deepseek-code-agent-extension` folder

2. **Start Local Server**:
   ```bash
   cd /workspace/local-server
   npm start
   ```

3. **Visit DeepSeek**:
   - Navigate to [chat.deepseek.com](https://chat.deepseek.com)
   - The extension will automatically inject save buttons on code blocks

## 🎨 GUI Features

### Header Section
- Extension logo and branding
- Tagline showing extension purpose

### Status Card
- Live server connection status with animated indicator
- Green = Connected, Red = Disconnected, Orange = Checking
- Refresh button to manually check status

### Quick Actions Grid
- **Save Current Code**: Trigger save on current page
- **Read File**: Open file reader modal
- **Settings**: Configuration options (coming soon)
- **Help**: Usage instructions and tips

### Recent Files Panel
- Scrollable list of last 10 saved files
- File type icons (🐍 Python, 📜 JavaScript, ⚛️ React, etc.)
- Relative timestamps (e.g., "5m ago", "2h ago")
- Click to preview file content
- Clear history option

### Statistics Dashboard
- Three stat cards showing:
  - Total files saved (all time)
  - Files saved today
  - Auto-corrected files count

### Footer
- Version number
- Quick link to open DeepSeek Chat

### Read File Modal
- Clean modal dialog for reading files
- File path input field
- Content preview textarea
- Cancel/Confirm actions

## 🎯 Usage

### Saving Code
1. Visit chat.deepseek.com
2. Look for code blocks in AI responses
3. Click the **💾 Save** button on any code block
4. The extension will:
   - Check for FILE annotations
   - Use Nvidia API for smart file naming if no annotation
   - Save to your local server
   - Show success indicator

### Reading Files
1. Click extension icon to open popup
2. Click **📂 Read File** button
3. Enter file path or select from recent files
4. Preview content in modal

### Using FILE Annotations
In your DeepSeek conversation, use this format:
```
// FILE: src/utils/helper.py
def my_function():
    pass
```

The extension will automatically save to the specified path.

## 🛠️ Development

### Modifying the GUI
- Edit `popup.html` for structure
- Edit `popup.css` for styles (uses CSS variables for theming)
- Edit `popup.js` for functionality

### Adding Features
1. Add new UI elements to `popup.html`
2. Style in `popup.css` using existing design system
3. Add event handlers in `popup.js`
4. Update `manifest.json` if adding permissions

### Color Scheme
Customize in `popup.css` root variables:
```css
:root {
  --primary-color: #4CAF50;      /* Main action color */
  --secondary-color: #2196F3;    /* Secondary actions */
  --success-color: #8BC34A;      /* Success states */
  --danger-color: #f44336;       /* Error states */
  --warning-color: #ff9800;      /* Warning states */
}
```

## 📋 Permissions

The extension requires:
- `storage`: Save statistics and recent files history
- `notifications`: Show save confirmations
- `host_permissions`: Access to localhost server and DeepSeek

## 🔧 Troubleshooting

### Extension icon shows but popup is blank
- Check browser console for errors
- Ensure all files are loaded correctly

### Server status shows "Offline"
- Verify local server is running on port 4000
- Check server health endpoint: `http://localhost:4000/health`

### Save buttons not appearing on DeepSeek
- Refresh the page
- Check browser console for content script errors
- Verify you're on `chat.deepseek.com`

## 📄 License

MIT License - Feel free to modify and distribute!

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- Settings panel implementation
- Dark mode support
- Custom themes
- Export/import functionality
- Cloud sync integration

---

**Enjoy saving code with style! 🎉**

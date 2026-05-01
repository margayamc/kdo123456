// DeepSeek Code Agent Pro - Popup Script

const SERVER_URL = 'http://localhost:4000';

// DOM Elements
const serverStatusEl = document.getElementById('serverStatus');
const refreshStatusBtn = document.getElementById('refreshStatus');
const saveCurrentBtn = document.getElementById('saveCurrentBtn');
const readFileBtn = document.getElementById('readFileBtn');
const openSettingsBtn = document.getElementById('openSettingsBtn');
const helpBtn = document.getElementById('helpBtn');
const recentFilesList = document.getElementById('recentFilesList');
const clearRecentBtn = document.getElementById('clearRecentBtn');
const totalSavedEl = document.getElementById('totalSaved');
const todaySavedEl = document.getElementById('todaySaved');
const autoCorrectedEl = document.getElementById('autoCorrected');
const openDeepSeekBtn = document.getElementById('openDeepSeek');

// Modal Elements
const readFileModal = document.getElementById('readFileModal');
const closeReadModal = document.getElementById('closeReadModal');
const filepathInput = document.getElementById('filepathInput');
const filePreview = document.getElementById('filePreview');
const cancelReadBtn = document.getElementById('cancelReadBtn');
const confirmReadBtn = document.getElementById('confirmReadBtn');

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  checkServerStatus();
  loadStatistics();
  loadRecentFiles();
  setupEventListeners();
});

/**
 * Check if the local server is running
 */
async function checkServerStatus() {
  try {
    const response = await fetch(`${SERVER_URL}/health`, {
      method: 'GET',
      timeout: 3000
    });
    
    if (response.ok) {
      updateServerStatus('connected', 'Server Connected');
    } else {
      updateServerStatus('disconnected', 'Server Error');
    }
  } catch (error) {
    updateServerStatus('disconnected', 'Server Offline');
  }
}

/**
 * Update server status UI
 */
function updateServerStatus(status, text) {
  const dot = serverStatusEl.querySelector('.status-dot');
  const textEl = serverStatusEl.querySelector('.status-text');
  
  dot.className = 'status-dot ' + status;
  textEl.textContent = text;
}

/**
 * Load statistics from storage
 */
async function loadStatistics() {
  try {
    const result = await chrome.storage.local.get(['stats']);
    const stats = result.stats || { total: 0, today: 0, corrected: 0 };
    
    totalSavedEl.textContent = stats.total || 0;
    todaySavedEl.textContent = stats.today || 0;
    autoCorrectedEl.textContent = stats.corrected || 0;
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

/**
 * Load recent files from storage
 */
async function loadRecentFiles() {
  try {
    const result = await chrome.storage.local.get(['recentFiles']);
    const files = result.recentFiles || [];
    
    if (files.length === 0) {
      showEmptyState();
      return;
    }
    
    renderRecentFiles(files.slice(0, 10)); // Show last 10 files
  } catch (error) {
    console.error('Error loading recent files:', error);
    showEmptyState();
  }
}

/**
 * Show empty state for recent files
 */
function showEmptyState() {
  recentFilesList.innerHTML = `
    <div class="empty-state">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
      <p>No recent files saved yet</p>
    </div>
  `;
}

/**
 * Render recent files list
 */
function renderRecentFiles(files) {
  recentFilesList.innerHTML = files.map(file => {
    const icon = getFileIcon(file.path);
    const time = formatTime(file.timestamp);
    const filename = file.path.split('/').pop();
    
    return `
      <div class="file-item" data-path="${escapeHtml(file.path)}">
        <div class="file-info">
          <span class="file-icon">${icon}</span>
          <span class="file-name" title="${escapeHtml(file.path)}">${escapeHtml(filename)}</span>
        </div>
        <span class="file-time">${time}</span>
      </div>
    `;
  }).join('');
  
  // Add click handlers
  recentFilesList.querySelectorAll('.file-item').forEach(item => {
    item.addEventListener('click', () => {
      const filepath = item.dataset.path;
      readFile(filepath);
    });
  });
}

/**
 * Get file icon based on extension
 */
function getFileIcon(filepath) {
  const ext = filepath.split('.').pop().toLowerCase();
  const icons = {
    'py': '🐍',
    'js': '📜',
    'ts': '📘',
    'jsx': '⚛️',
    'tsx': '⚛️',
    'html': '🌐',
    'css': '🎨',
    'scss': '🎨',
    'json': '📋',
    'md': '📝',
    'txt': '📄',
    'java': '☕',
    'c': '©️',
    'cpp': '⚡',
    'go': '🔹',
    'rs': '🦀',
    'rb': '💎',
    'php': '🐘',
    'swift': '🍎',
    'kt': '🎯',
    'sh': '💻',
    'sql': '🗄️',
    'yaml': '📊',
    'yml': '📊',
    'xml': '📋',
    'vue': '💚'
  };
  return icons[ext] || '📄';
}

/**
 * Format timestamp to relative time
 */
function formatTime(timestamp) {
  const now = new Date();
  const date = new Date(timestamp);
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return date.toLocaleDateString();
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Refresh status button
  refreshStatusBtn.addEventListener('click', checkServerStatus);
  
  // Save current code button
  saveCurrentBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].url.includes('chat.deepseek.com')) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'saveCurrentCode' });
        window.close();
      } else {
        alert('Please navigate to chat.deepseek.com to save code');
      }
    });
  });
  
  // Read file button
  readFileBtn.addEventListener('click', () => {
    readFileModal.classList.add('active');
  });
  
  // Open settings button
  openSettingsBtn.addEventListener('click', () => {
    alert('Settings panel coming soon!\n\nFor now, you can configure:\n- Server URL in content.js\n- Notification preferences\n- Auto-save options');
  });
  
  // Help button
  helpBtn.addEventListener('click', () => {
    showHelp();
  });
  
  // Clear recent files
  clearRecentBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to clear recent files history?')) {
      await chrome.storage.local.set({ recentFiles: [] });
      loadRecentFiles();
    }
  });
  
  // Open DeepSeek
  openDeepSeekBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://chat.deepseek.com' });
  });
  
  // Modal close buttons
  closeReadModal.addEventListener('click', () => {
    readFileModal.classList.remove('active');
  });
  
  cancelReadBtn.addEventListener('click', () => {
    readFileModal.classList.remove('active');
  });
  
  // Confirm read file
  confirmReadBtn.addEventListener('click', () => {
    const filepath = filepathInput.value.trim();
    if (filepath) {
      readFile(filepath);
      readFileModal.classList.remove('active');
    } else {
      alert('Please enter a file path');
    }
  });
  
  // Close modal on outside click
  readFileModal.addEventListener('click', (e) => {
    if (e.target === readFileModal) {
      readFileModal.classList.remove('active');
    }
  });
}

/**
 * Read file from server
 */
async function readFile(filepath) {
  try {
    const encodedPath = encodeURIComponent(filepath);
    const response = await fetch(`${SERVER_URL}/read?filepath=${encodedPath}`);
    const result = await response.json();
    
    if (result.content !== undefined) {
      filePreview.value = result.content;
      filepathInput.value = filepath;
      
      // If called from recent files, show modal with content
      if (!readFileModal.classList.contains('active')) {
        readFileModal.classList.add('active');
      }
    } else {
      alert(`Error reading file: ${result.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Read error:', error);
    alert(`Failed to connect to server: ${error.message}`);
  }
}

/**
 * Show help information
 */
function showHelp() {
  const helpContent = `
📖 DeepSeek Code Agent Pro - Help

✨ Features:
• Auto-save code blocks from DeepSeek
• AI-powered file naming via Nvidia API
• Syntax error correction
• FILE annotation support
• Recent files tracking

🚀 How to Use:
1. Visit chat.deepseek.com
2. Click 💾 Save on any code block
3. Or use FILE: annotations
4. Access saved files via popup

📝 FILE Annotation Format:
// FILE: path/to/file.py

⚙️ Requirements:
• Local server running on port 4000
• Nvidia API key for auto-naming

🔗 Links:
• GitHub: [Your Repo]
• Documentation: [Your Docs]
  `;
  
  alert(helpContent);
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'FILE_SAVED') {
    // Update statistics
    loadStatistics();
    loadRecentFiles();
    sendResponse({ success: true });
  }
  return true;
});

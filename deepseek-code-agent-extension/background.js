// DeepSeek Code Agent Pro - Background Service Worker
// Handles notifications and extension lifecycle

console.log('[DS Agent] Background service worker started');

// Listen for installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[DS Agent] Extension installed:', details.reason);
  
  if (details.reason === 'install') {
    // Show welcome notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'DeepSeek Code Agent Pro Installed',
      message: 'Visit chat.deepseek.com to start saving code blocks!',
      priority: 2
    });
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SHOW_NOTIFICATION') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: message.title,
      message: message.content,
      priority: message.priority || 2
    });
    sendResponse({ success: true });
  }
  return true;
});

// Keep service worker alive
setInterval(() => {
  chrome.runtime.getPlatformInfo(() => {});
}, 20000);

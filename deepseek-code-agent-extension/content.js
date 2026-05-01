// DeepSeek Code Agent - Content Script
// This script injects Save/Read buttons into the DeepSeek chat interface

(function() {
  'use strict';

  const SERVER_URL = 'http://localhost:4000';
  const PROCESSED_ATTR = 'data-ds-agent-processed';

  // Track processed messages to avoid duplicate buttons
  const processedMessages = new Set();

  /**
   * Creates a styled button element
   * @param {string} text - Button text
   * @param {Function} onClick - Click handler
   * @returns {HTMLButtonElement}
   */
  function createButton(text, onClick) {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.style.cssText = `
      position: absolute;
      top: 5px;
      right: 5px;
      z-index: 10;
      background: #4CAF50;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-weight: bold;
      opacity: 0.9;
      transition: opacity 0.2s;
    `;
    btn.onmouseover = () => btn.style.opacity = '1';
    btn.onmouseout = () => btn.style.opacity = '0.9';
    btn.onclick = onClick;
    return btn;
  }

  /**
   * Shows success indicator next to button
   * @param {HTMLElement} button 
   */
  function showSuccess(button) {
    const checkmark = document.createElement('span');
    checkmark.textContent = ' ✅';
    checkmark.style.cssText = 'font-size: 14px; margin-left: 5px;';
    button.parentNode.appendChild(checkmark);
    button.disabled = true;
    button.style.background = '#8BC34A';
  }

  /**
   * Extracts FILE annotations from message text
   * @param {string} text - Message text content
   * @returns {string[]} Array of file paths
   */
  function extractFileAnnotations(text) {
    const regex = /\/\/\s*FILE:\s*(.+)/g;
    const matches = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      matches.push(match[1].trim());
    }
    return matches;
  }

  /**
   * Saves code with explicit file path
   * @param {string} filepath 
   * @param {string} content 
   * @param {HTMLElement} button 
   */
  async function saveWithExplicitPath(filepath, content, button) {
    try {
      const response = await fetch(`${SERVER_URL}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filepath, content })
      });
      
      const result = await response.json();
      
      if (result.ok) {
        showSuccess(button);
      } else {
        alert(`Error saving file: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert(`Failed to connect to server: ${error.message}`);
    }
  }

  /**
   * Auto-saves code using Nvidia API for path determination
   * @param {string} code 
   * @param {string} language 
   * @param {HTMLElement} button 
   */
  async function autoSave(code, language, button) {
    try {
      const response = await fetch(`${SERVER_URL}/auto-save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
      });
      
      const result = await response.json();
      
      if (result.ok) {
        alert(`Code saved to: ${result.path}${result.corrected ? '\n(Note: Some syntax errors were corrected)' : ''}`);
        showSuccess(button);
      } else {
        alert(`Error: ${result.error || 'Failed to save code'}`);
      }
    } catch (error) {
      console.error('Auto-save error:', error);
      alert(`Failed to connect to server: ${error.message}`);
    }
  }

  /**
   * Processes a single AI message element
   * @param {HTMLElement} messageEl 
   */
  function processMessage(messageEl) {
    // Skip if already processed
    if (processedMessages.has(messageEl)) return;
    
    // Find all code blocks in this message
    const codeBlocks = messageEl.querySelectorAll('pre code');
    if (codeBlocks.length === 0) return;

    // Mark as processed
    processedMessages.add(messageEl);
    messageEl.setAttribute(PROCESSED_ATTR, 'true');

    // Get message text for FILE annotations
    const messageText = messageEl.textContent || '';
    const fileAnnotations = extractFileAnnotations(messageText);

    // Process each code block
    codeBlocks.forEach((codeBlock, index) => {
      // Check if already wrapped
      if (codeBlock.parentElement.style.position === 'relative') return;

      // Wrap code block in positioned container
      const pre = codeBlock.parentElement;
      const wrapper = document.createElement('div');
      wrapper.style.position = 'relative';
      wrapper.style.display = 'inline-block';
      wrapper.style.width = '100%';
      
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      // Create save button
      const saveBtn = createButton('💾 Save', async () => {
        const code = codeBlock.textContent;
        const languageClass = codeBlock.className;
        let language = 'text';
        
        // Extract language from class (e.g., "language-python" -> "python")
        const langMatch = languageClass.match(/language-(\w+)/);
        if (langMatch) {
          language = langMatch[1];
        }

        // Check if there's an explicit file annotation for this block
        if (index < fileAnnotations.length) {
          const filepath = fileAnnotations[index];
          await saveWithExplicitPath(filepath, code, saveBtn);
        } else {
          // Use auto-save with Nvidia API
          await autoSave(code, language, saveBtn);
        }
      });

      wrapper.appendChild(saveBtn);

      // If annotation exists, auto-save immediately
      if (index < fileAnnotations.length) {
        const filepath = fileAnnotations[index];
        const code = codeBlock.textContent;
        saveWithExplicitPath(filepath, code, saveBtn);
      }
    });
  }

  /**
   * Scans the page for AI messages and processes them
   */
  function scanForMessages() {
    // Look for AI message containers (adjust selector based on actual DeepSeek structure)
    const aiMessages = document.querySelectorAll('.ds-markdown, [class*="message"], [class*="response"]');
    
    aiMessages.forEach(msg => {
      // Only process messages that contain code blocks and aren't marked
      if (!msg.getAttribute(PROCESSED_ATTR) && msg.querySelector('pre code')) {
        processMessage(msg);
      }
    });
  }

  /**
   * Injects the Read File button near the chat input
   */
  function injectReadButton() {
    // Try multiple selectors for the chat input area
    const textareaSelectors = [
      'textarea[placeholder*="message"]',
      'textarea[placeholder*="chat"]',
      'textarea[class*="input"]',
      'textarea'
    ];

    let textarea = null;
    for (const selector of textareaSelectors) {
      textarea = document.querySelector(selector);
      if (textarea) break;
    }

    if (!textarea) return;

    // Check if button already exists
    if (document.getElementById('ds-agent-read-btn')) return;

    // Create read button container
    const btnContainer = document.createElement('div');
    btnContainer.id = 'ds-agent-read-btn';
    btnContainer.style.cssText = `
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
    `;

    const readBtn = document.createElement('button');
    readBtn.textContent = '📂 Read File';
    readBtn.style.cssText = `
      background: #2196F3;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      font-weight: bold;
    `;

    readBtn.onclick = async () => {
      const filepath = prompt('Enter the file path to read:');
      if (!filepath) return;

      try {
        const encodedPath = encodeURIComponent(filepath);
        const response = await fetch(`${SERVER_URL}/read?filepath=${encodedPath}`);
        const result = await response.json();

        if (result.content !== undefined) {
          textarea.value = result.content;
          // Trigger input event for React/Vue compatibility
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
          alert(`Error reading file: ${result.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Read error:', error);
        alert(`Failed to connect to server: ${error.message}`);
      }
    };

    btnContainer.appendChild(readBtn);

    // Insert before textarea
    textarea.parentNode.insertBefore(btnContainer, textarea);
  }

  /**
   * Sets up mutation observer for dynamic content
   */
  function setupObserver() {
    const observer = new MutationObserver((mutations) => {
      let shouldScan = false;
      
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          shouldScan = true;
          break;
        }
      }
      
      if (shouldScan) {
        scanForMessages();
        injectReadButton();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Handles URL changes in SPA
   */
  function handleUrlChange() {
    processedMessages.clear();
    setTimeout(() => {
      scanForMessages();
      injectReadButton();
    }, 500);
  }

  // Listen for URL changes (SPA navigation)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      handleUrlChange();
    }
  }).observe(document, { subtree: true, childList: true });

  // Initial scan after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      scanForMessages();
      injectReadButton();
      setupObserver();
    }, 1000);
  });

  // Also run immediately in case DOM is already ready
  if (document.readyState !== 'loading') {
    setTimeout(() => {
      scanForMessages();
      injectReadButton();
      setupObserver();
    }, 500);
  }

})();

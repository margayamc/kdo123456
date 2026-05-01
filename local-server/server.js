/**
 * DeepSeek Code Agent - Local Server
 * 
 * This server handles:
 * 1. Saving code files to the local codebase
 * 2. Reading files from the local codebase
 * 3. Auto-saving with Nvidia API integration for intelligent file naming and error correction
 * 
 * Environment Variables:
 * - CODABASE_PATH (required): Root directory of the user's codebase
 * - NVIDIA_API_KEY (required): API key for Nvidia NIM
 */

const express = require('express');
const fs = require('fs-extra');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

// Configuration from environment variables
const CODABASE_PATH = process.env.CODABASE_PATH;
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;

// Validate required environment variables
if (!CODABASE_PATH) {
  console.error('ERROR: CODABASE_PATH environment variable is required');
  process.exit(1);
}

if (!NVIDIA_API_KEY) {
  console.error('ERROR: NVIDIA_API_KEY environment variable is required');
  process.exit(1);
}

// Resolve and validate the codebase path
const resolvedCodebasePath = path.resolve(CODABASE_PATH);
if (!fs.existsSync(resolvedCodebasePath)) {
  console.error(`ERROR: CODABASE_PATH does not exist: ${resolvedCodebasePath}`);
  process.exit(1);
}

console.log(`Codebase Path: ${resolvedCodebasePath}`);
console.log('Starting DeepSeek Code Agent Server...');

const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

/**
 * Safely resolves a path relative to CODABASE_PATH
 * Throws an error if the resolved path is outside CODABASE_PATH
 * @param {string} requestedPath - The path to resolve
 * @returns {string} - The safe, resolved absolute path
 */
function safePath(requestedPath) {
  // Normalize and resolve the path
  const normalizedPath = path.normalize(requestedPath);
  const resolvedPath = path.resolve(resolvedCodebasePath, normalizedPath);
  
  // Ensure the resolved path is within the codebase directory
  if (!resolvedPath.startsWith(resolvedCodebasePath)) {
    throw new Error('Directory traversal detected: Path must be within CODABASE_PATH');
  }
  
  return resolvedPath;
}

/**
 * POST /save
 * Saves code content to a specified file path
 * Request body: { filepath: string, content: string }
 */
app.post('/save', async (req, res) => {
  try {
    const { filepath, content } = req.body;
    
    if (!filepath || typeof filepath !== 'string') {
      return res.status(400).json({ ok: false, error: 'Missing or invalid filepath' });
    }
    
    if (content === undefined) {
      return res.status(400).json({ ok: false, error: 'Missing content' });
    }
    
    // Validate and resolve the path
    const safeFilePath = safePath(filepath);
    
    // Create intermediate directories if needed
    const dirPath = path.dirname(safeFilePath);
    await fs.ensureDir(dirPath);
    
    // Write the file
    await fs.writeFile(safeFilePath, content, 'utf-8');
    
    console.log(`Saved file: ${safeFilePath}`);
    res.json({ ok: true, path: filepath });
  } catch (error) {
    console.error('Save error:', error.message);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * GET /read
 * Reads a file from the codebase
 * Query param: filepath (URL-encoded)
 */
app.get('/read', async (req, res) => {
  try {
    const { filepath } = req.query;
    
    if (!filepath || typeof filepath !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid filepath parameter' });
    }
    
    // Decode the filepath
    const decodedPath = decodeURIComponent(filepath);
    
    // Validate and resolve the path
    const safeFilePath = safePath(decodedPath);
    
    // Check if file exists
    if (!await fs.pathExists(safeFilePath)) {
      return res.status(404).json({ error: `File not found: ${decodedPath}` });
    }
    
    // Read and return the file content
    const content = await fs.readFile(safeFilePath, 'utf-8');
    console.log(`Read file: ${safeFilePath}`);
    res.json({ content });
  } catch (error) {
    console.error('Read error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /auto-save
 * Uses Nvidia API to determine file path and fix syntax errors
 * Request body: { code: string, language: string }
 */
app.post('/auto-save', async (req, res) => {
  try {
    const { code, language } = req.body;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ ok: false, error: 'Missing or invalid code' });
    }
    
    if (!language || typeof language !== 'string') {
      return res.status(400).json({ ok: false, error: 'Missing or invalid language' });
    }
    
    // Construct prompt for Nvidia API
    const prompt = `You are a code analyzer. Given the following code and its language, suggest the most appropriate relative file path (including extension and subdirectory if needed) for a typical project. If there are any syntax errors, fix them. Output ONLY in this exact format:
// FILE: path/to/file.ext
\`\`\`${language}
[corrected or original code]
\`\`\`
Do not add any explanation.

Language: ${language}

Code:
${code}`;

    // Call Nvidia API
    const nvidiaResponse = await axios.post(
      'https://integrate.api.nvidia.com/v1/chat/completions',
      {
        model: 'google/gemma-3n-e4b-it',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 2048,
        temperature: 0.1,
        top_p: 0.95,
        chat_template_kwargs: { enable_thinking: true }
      },
      {
        headers: {
          'Authorization': `Bearer ${NVIDIA_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );
    
    // Parse the response
    const assistantMessage = nvidiaResponse.data.choices?.[0]?.message?.content || '';
    
    if (!assistantMessage) {
      throw new Error('Empty response from Nvidia API');
    }
    
    console.log('Nvidia API Response:', assistantMessage.substring(0, 200) + '...');
    
    // Extract file path and code from response
    let extractedFilepath = null;
    let extractedCode = null;
    
    // Try to extract FILE annotation
    const fileMatch = assistantMessage.match(/\/\/\s*FILE:\s*(.+)/i);
    if (fileMatch && fileMatch[1]) {
      extractedFilepath = fileMatch[1].trim();
    }
    
    // Try to extract code block
    const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)```/;
    const codeMatch = assistantMessage.match(codeBlockRegex);
    if (codeMatch && codeMatch[1]) {
      extractedCode = codeMatch[1].trim();
    }
    
    // Fallback: Use rule-based mapping if extraction fails
    if (!extractedFilepath || !extractedCode) {
      console.log('Using fallback rule-based path determination');
      
      // Map language to extension
      const extensionMap = {
        'python': '.py',
        'javascript': '.js',
        'typescript': '.ts',
        'jsx': '.jsx',
        'tsx': '.tsx',
        'java': '.java',
        'c': '.c',
        'cpp': '.cpp',
        'c++': '.cpp',
        'go': '.go',
        'rust': '.rs',
        'ruby': '.rb',
        'php': '.php',
        'swift': '.swift',
        'kotlin': '.kt',
        'scala': '.scala',
        'html': '.html',
        'css': '.css',
        'scss': '.scss',
        'sass': '.sass',
        'less': '.less',
        'sql': '.sql',
        'shell': '.sh',
        'bash': '.sh',
        'yaml': '.yaml',
        'yml': '.yml',
        'json': '.json',
        'xml': '.xml',
        'markdown': '.md',
        'md': '.md',
        'r': '.r',
        'matlab': '.m',
        'lua': '.lua',
        'perl': '.pl',
        'haskell': '.hs',
        'elixir': '.ex',
        'clojure': '.clj',
        'dart': '.dart',
        'flutter': '.dart',
        'text': '.txt'
      };
      
      const ext = extensionMap[language.toLowerCase()] || `.${language}`;
      extractedFilepath = `src/generated${ext}`;
      extractedCode = code;
    }
    
    // Determine if code was corrected
    const corrected = extractedCode !== code;
    
    // Save the file using internal logic
    const safeFilePath = safePath(extractedFilepath);
    const dirPath = path.dirname(safeFilePath);
    await fs.ensureDir(dirPath);
    await fs.writeFile(safeFilePath, extractedCode, 'utf-8');
    
    console.log(`Auto-saved file: ${safeFilePath}${corrected ? ' (corrected)' : ''}`);
    res.json({ 
      ok: true, 
      path: extractedFilepath, 
      corrected: corrected 
    });
  } catch (error) {
    console.error('Auto-save error:', error.message);
    
    // Fallback: Try to save with a generic path
    try {
      const { code, language } = req.body;
      const extensionMap = {
        'python': '.py',
        'javascript': '.js',
        'typescript': '.ts',
        'text': '.txt'
      };
      const ext = extensionMap[language?.toLowerCase()] || '.txt';
      const fallbackPath = `src/fallback_${Date.now()}${ext}`;
      
      const safeFilePath = safePath(fallbackPath);
      const dirPath = path.dirname(safeFilePath);
      await fs.ensureDir(dirPath);
      await fs.writeFile(safeFilePath, code, 'utf-8');
      
      console.log(`Fallback save: ${safeFilePath}`);
      res.json({ 
        ok: true, 
        path: fallbackPath, 
        corrected: false,
        note: 'Nvidia API failed, used fallback path'
      });
    } catch (fallbackError) {
      res.status(500).json({ 
        ok: false, 
        error: `Auto-save failed: ${error.message}. Fallback also failed: ${fallbackError.message}` 
      });
    }
  }
});

/**
 * GET /list (optional)
 * Lists directory contents
 * Query param: dir (optional, defaults to root)
 */
app.get('/list', async (req, res) => {
  try {
    const { dir } = req.query;
    const requestedDir = dir ? decodeURIComponent(dir) : '';
    
    // Validate and resolve the path
    const safeDirPath = safePath(requestedDir || '');
    
    // Check if directory exists
    if (!await fs.pathExists(safeDirPath)) {
      return res.status(404).json({ error: `Directory not found: ${requestedDir}` });
    }
    
    // Read directory contents
    const entries = await fs.readdir(safeDirPath, { withFileTypes: true });
    
    const result = entries.map(entry => ({
      name: entry.name,
      isDirectory: entry.isDirectory(),
      isFile: entry.isFile()
    }));
    
    res.json({ contents: result, path: requestedDir || '/' });
  } catch (error) {
    console.error('List error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', codebasePath: resolvedCodebasePath });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

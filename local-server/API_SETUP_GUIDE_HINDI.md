# DeepSeek Code Agent - API Setup Guide (हिंदी)

## 🚀 API कुंजी कैसे सेट करें

### चरण 1: Nvidia API Key प्राप्त करें (मुफ्त)

1. **वेबसाइट खोलें**: https://build.nvidia.com/
2. **साइन अप करें**: 
   - Google या GitHub अकाउंट से लॉगिन करें
   - नया अकाउंट बनाएं (मुफ्त क्रेडिट मिलता है!)
3. **API Key जनरेट करें**:
   - Dashboard में जाएं
   - "API Keys" टैब पर क्लिक करें
   - "Generate New Key" बटन दबाएं
   - अपनी API Key कॉपी करें (यह `nvapi-` से शुरू होती है)

### चरण 2: .env फ़ाइल को एडिट करें

1. **फ़ाइल खोलें**: `local-server/.env`

2. **मान अपडेट करें**:
   ```env
   # अपने प्रोजेक्ट का पूरा पाथ डालें
   CODABASE_PATH=/workspace/my-project
   
   # अपनी Nvidia API Key डालें (nvapi-... से शुरू होने वाली)
   NVIDIA_API_KEY=nvapi-apki-actual-key-yahan
   
   # सर्वर पोर्ट (वैकल्पिक)
   PORT=4000
   ```

#### Windows उपयोगकर्ताओं के लिए:
```env
CODABASE_PATH=D:/Work/Web_Development/shoot/kdo123456
```
या
```env
CODABASE_PATH=D:\\Work\\Web_Development\\shoot\\kdo123456
```

#### Linux/Mac उपयोगकर्ताओं के लिए:
```env
CODABASE_PATH=/home/username/my-project
```
या
```env
CODABASE_PATH=~/my-project
```

### चरण 3: सर्वर शुरू करें

```bash
cd local-server
npm install
npm start
```

**सफल संदेश दिखना चाहिए**:
```
Codebase Path: /workspace/my-project
Starting DeepSeek Code Agent Server...
Server running on http://localhost:4000
✅ Server is ready!
```

### चरण 4: Chrome Extension लोड करें

1. Chrome खोलें और जाएं: `chrome://extensions/`
2. **Developer mode** चालू करें (ऊपर दाईं ओर टॉगल)
3. **Load unpacked** बटन पर क्लिक करें
4. `deepseek-code-agent-extension` फोल्डर चुनें
5. एक्सटेंशन लोड हो जाना चाहिए ✅

### चरण 5: टेस्ट करें!

1. https://chat.deepseek.com/ पर जाएं
2. **"📂 Read File"** बटन दिखाई देना चाहिए
3. DeepSeek से कुछ कोड बनाने को कहें
4. कोड ब्लॉक्स पर **"💾 Save"** बटन दिखना चाहिए!

---

## ❌ समस्याएं और समाधान

### त्रुटि: "CODABASE_PATH environment variable is required"
**समाधान**:
- `.env` फ़ाइल चेक करें कि वह `local-server` फोल्डर में है
- `CODABASE_PATH` सही से सेट किया है क्या?
- सर्वर रीस्टार्ट करें: `Ctrl+C` दबाएं और फिर `npm start`

### त्रुटि: "NVIDIA_API_KEY environment variable is required"
**समाधान**:
- https://build.nvidia.com/ से API key प्राप्त करें
- `.env` फ़ाइल में डालें: `NVIDIA_API_KEY=nvapi-your-key`
- सर्वर रीस्टार्ट करें

### त्रुटि: "CODABASE_PATH does not exist"
**समाधान**:
- फोल्डर बनाएं: `mkdir -p /workspace/my-project`
- या `.env` में सही पाथ डालें

### एक्सटेंशन बटन नहीं दिख रहे
**समाधान**:
- DeepSeek पेज रिफ्रेश करें (F5)
- `chrome://extensions/` में चेक करें कि एक्सटेंशन enabled है
- Browser console में errors चेक करें (F12 → Console)

### सर्वर शुरू नहीं हो रहा
**समाधान**:
- पोर्ट 4000 पहले से तो इस्तेमाल नहीं हो रहा?
- `.env` में PORT बदलकर देखें (जैसे 4001)

---

## 📝 उदाहरण .env फ़ाइल

```env
# प्रोजेक्ट रूट डायरेक्टरी
CODABASE_PATH=/workspace/my-project

# Nvidia API Key (मुफ्त की प्राप्त करें: https://build.nvidia.com/)
NVIDIA_API_KEY=nvapi-xxxxxxxxxxxxxxxxxxxx

# सर्वर पोर्ट
PORT=4000
```

---

## 🎯 कैसे उपयोग करें

### ऑटो-सेव (Annotations के साथ)
जब DeepSeek कोड वापस करता है file annotations के साथ:
```python
// FILE: src/hello.py
def hello():
    print("Hello, World!")
```
फ़ाइल अपने आप सेव हो जाएगी! ✅

### मैन्युअल सेव
किसी भी कोड ब्लॉक पर **"💾 Save"** बटन क्लिक करें। AI:
1. सबसे अच्छा फ़ाइल नाम सुझाएगा
2. syntax errors ठीक करेगा
3. आपके प्रोजेक्ट में सेव करेगा

### फ़ाइलें पढ़ें
**"📂 Read File"** क्लिक करें, path डालें जैसे `src/app.js`, और फ़ाइल का content chat में लोड हो जाएगा!

---

## 🔗 महत्वपूर्ण लिंक्स

- **Nvidia API Console**: https://build.nvidia.com/
- **DeepSeek Chat**: https://chat.deepseek.com/
- **Model Info**: google/gemma-3n-e4b-it

---

## 💡 टिप्स

1. **मुफ्त टियर**: Nvidia नए उपयोगकर्ताओं को मुफ्त क्रेडिट देता है
2. **सुरक्षा**: `.env` फ़ाइल को Git में कभी commit न करें (यह .gitignore में है)
3. **प्रदर्शन**: बेहतर फ़ाइल सुझावों के लिए प्रोजेक्ट फोल्डर व्यवस्थित रखें
4. **बैकअप**: सर्वर अपने आप intermediate directories बनाता है

Happy Coding! 🚀

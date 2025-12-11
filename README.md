# TryOnNow - Virtual Try-On Chrome Extension

AI-powered virtual try-on for Amazon India & Flipkart. Upload your photo, select a product, and see yourself wearing it instantly.

![Demo](https://img.shields.io/badge/Platform-Chrome-blue) ![Version](https://img.shields.io/badge/Version-1.0.0-green)

## 🎥 Demo

[![Watch Demo](https://img.shields.io/badge/YouTube-Watch%20Demo-red?logo=youtube)](https://youtu.be/x5eOayGw33g?si=1Le4AbQUZvbcO9zR)

---

## 🚀 Quick Install (Pre-built)

1. **Download** `dist.zip` from [Google Drive](https://drive.google.com/file/d/1AwLA2K9jxZfjuWG1p5bzkpSDd4_N3j4E/view)
2. **Extract** the zip to a folder
3. Open Chrome and go to `chrome://extensions/`
4. Enable **Developer mode** (toggle in top-right)
5. Click **Load unpacked**
6. Select the extracted `dist` folder
7. Visit [Amazon.in](https://www.amazon.in) or [Flipkart.com](https://www.flipkart.com) and browse clothing products

---

## 🛠️ Build from Source

### Prerequisites

- Node.js (v18+)
- npm

### Steps

```bash
# Clone the repo
git clone https://github.com/RahulMirji/TryOnNow.git
cd TryOnNow/tryon-extension

# Install dependencies
npm install

# Build the extension
npm run build
```

The built extension will be in the `dist/` folder.

### Load in Chrome

1. Go to `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `tryon-extension/dist` folder

---

## 📁 Project Structure

```
TryOnNow/
├── tryon-extension/          # Chrome extension
│   ├── src/                  # Source code (React + TypeScript)
│   ├── public/               # Static assets & manifest.json
│   ├── dist/                 # Built extension (load this in Chrome)
│   └── dist.zip              # Pre-packaged for distribution
│
└── supabase/
    └── functions/
        └── generate-tryon/   # Edge Function (AI backend)
```

---

## ✨ Features

- 🛒 Works on **Amazon India** & **Flipkart**
- 📸 Upload your photo and try on clothing instantly
- 🤖 Powered by **Gemini AI** for realistic virtual try-on
- 💾 Download generated images
- 🔄 30 try-ons per day (rate limited)

---

## 🔧 Tech Stack

| Component | Technology |
|-----------|------------|
| Extension | React, TypeScript, Vite |
| Backend | Supabase Edge Functions (Deno) |
| AI | Google Gemini API |

---

## 📜 License

MIT License. Free for personal and educational use.

---

**Made with ❤️ for hackathon**

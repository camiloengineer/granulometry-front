# Granulometry-Front - Granulometry Dashboard

![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat\&logo=react\&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-4.4.5-646CFF?style=flat\&logo=vite\&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3.3-06B6D4?style=flat\&logo=tailwindcss\&logoColor=white)

## 🚀 Overview

The **Granulometry Dashboard** is a specialized React application for granulometry monitoring and fragmentation analysis. It provides visual analytics and monitoring capabilities for particle size distribution and material fragmentation.

## 🚀 Quick Start

```bash
npm install
npm start                  # Start dev server (port 4202)
npm run build              # Build for production
```

### Access Points

* [http://localhost:4202](http://localhost:4202)
* [https://reportability-granulometry.web.app](https://reportability-granulometry.web.app) (Firebase)

## 📁 Project Structure

```
granulometry-front/
├── index.jsx                # Main entry
├── main.jsx                 # React root
├── index.html               # HTML template
├── index.css                # Global styles
├── public/                  # Static assets
│   ├── muestra.jpg
│   ├── muestra.png
│   ├── raw.jpg
│   └── robots.txt
├── vite.config.js           # Vite setup
├── webpack.config.js        # Alt config (future federation)
├── tailwind.config.js       # Tailwind setup
├── postcss.config.js        # PostCSS setup
├── package.json
└── README.md
```

## 🛠️ Tech Stack

* React 18
* Vite
* TailwindCSS
* Recharts
* Lucide React
* Firebase Hosting

## 📋 Commands

```bash
npm start             # Dev server
npm run build         # Prod build
npm run preview       # Preview build
npm run deploy        # Deploy to Firebase

npm run start:webpack # (optional) Start with Webpack
npm run build:webpack # (optional) Build with Webpack
```

## 🎨 Features

* Particle size distribution
* Real-time monitoring
* Fragmentation visualization
* Data export & download
* Image-based analysis

## ⚙️ Configuration

### vite.config.js

```js
export default defineConfig({
  server: { port: 4202 },
  build: { chunkSizeWarningLimit: 1000 }
});
```

### tailwind.config.js

```js
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
```

## 🔧 Integration

This app is **standalone** but intended for integration via **iframe** or **Module Federation** once migrated to Angular.

* Runs on port 4202
* Ready to be exposed as a remote entry
* Minimal logic: mostly UI & data display

## 🧪 Development

* Hot Module Reload via Vite
* Static assets in `public/`
* Tailwind for styling

## 🤝 Contributing

```bash
npm install
npm start
# Make changes
npm run build
```

* Follow ES6+ syntax
* Use React hooks
* Tailwind for styling
* Functional components only

## 📖 Related Docs

* `../README.md` - Root
* `../host-front/README.md` - Host shell
* `../uncrushable-front/README.md` - Remote features
* `../CLAUDE.md` - AI contribution guide

---

🔬 **Experimental React App | Granulometry Dashboard | Disposable & Migratable**

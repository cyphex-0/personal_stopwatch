# ⏱️ Minimalist Timer

An ultra-minimalist, distraction-free countdown timer built with Electron. Designed for focused study sessions and productivity, this timer stays "Always-On-Top" to keep you on track without cluttering your workspace.

## ✨ Features

- **Minimalist Design**: A sleek, tiny window that shows only what you need.
- **Always-On-Top**: Stays visible above other windows (even in full-screen modes).
- **Persistent State**: Automatically saves your remaining time if the app is closed, resuming exactly where you left off.
- **Keyboard Friendly**: Quick interactions for setting and starting timers.
- **No Decorations**: Transparent, frame-less window for a clean look.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- npm (usually comes with Node.js)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/minimalist-timer.git
   cd minimalist-timer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the application:
   ```bash
   npm start
   ```

## 🛠️ Build and Distribution

To package the application for distribution:

```bash
# Package for the current platform
npm run pack

# Build installers (Windows setup file)
npm run dist
```

## 🛠️ Built With

- [Electron](https://www.electronjs.org/) - Framework for building cross-platform desktop apps with web technologies.
- [Vanilla JavaScript/CSS/HTML](https://developer.mozilla.org/en-US/) - For a lightweight and performant experience.

## 📄 License

This project is licensed under the ISC License.

# ♟️ E-Chess – Developer Chess Toolkit

## 📖 Overview

E-Chess is a modern developer toolkit for building interactive, scalable chess applications using React and TypeScript. It provides a clean development environment, a rich set of reusable UI components, and an evolving chess game engine—allowing developers to focus on crafting high-quality chess experiences.

## ✨ Features & Status
Feature	Status
Component Library - Ready
Developer Experience - Ready
Game Engine	- In Progress
Responsive & Accessible UI - In Progress
Notifications & Sound	- In Progress

Component Library – Reusable and accessible UI components (buttons, dialogs, navigation, etc.)
Developer Experience – Preconfigured with Vite, Tailwind CSS, ESLint, and TypeScript

## 📁 Project Structure
```
E-Chess/
├── public/                    # Static assets
│   ├── chess_logo.webp
│   ├── placeholder.svg
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── chess/            # Chess-specific components
│   │   │   ├── CapturedPieces.tsx
│   │   │   ├── ChessBoard.tsx
│   │   │   ├── ChessClock.tsx
│   │   │   ├── ChessGame.tsx
│   │   │   ├── ChessPiece.tsx
│   │   │   ├── ChessSquare.tsx
│   │   │   ├── EvaluationBar.tsx
│   │   │   ├── GameControls.tsx
│   │   │   ├── GameStatus.tsx
│   │   │   ├── MoveHistory.tsx
│   │   │   ├── NewGameDialog.tsx
│   │   │   ├── PromotionDialog.tsx
│   │   │   └── ThemeToggle.tsx
│   │   └── ui/               # Reusable UI components
│   ├── hooks/                # Custom React hooks
│   │   ├── use-mobile.tsx
│   │   ├── use-toast.ts
│   │   └── useChessGame.ts
│   ├── lib/                  # Core logic and utilities
│   │   ├── chess-engine.ts
│   │   ├── sounds.ts
│   │   └── utils.ts
│   ├── pages/                # Page components
│   │   ├── Index.tsx
│   │   └── NotFound.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── README.md
```
## 📦 Getting Started
Prerequisites

Node.js – Latest LTS recommended

Package Manager – npm or bun

Language – TypeScript

Installation

Clone the repository:

git clone https://github.com/Ellidan-web/E-Chess

Navigate to the project directory:

cd E-Chess

Install dependencies:

npm install
# or
bun install
##  🎮 Usage

Start the development server:

npm run dev
# or
npm start

The app will be available at http://localhost:5173 by default.

##  🧪 Testing

E-Chess includes a built-in testing setup. Run tests with:

npm test
##  🛠 Built With
React – UI library

TypeScript – Type safety

Vite – Fast build tooling

Tailwind CSS – Utility-first styling

ESLint – Code quality and consistency

UI Components – Custom library inspired by shadcn/ui

##  📄 License
This project is licensed under the MIT License. See the LICENSE file for details.

## 🤝 Contributing
Contributions are welcome!
Open an issue for bugs or feature requests
Submit a pull request for improvements




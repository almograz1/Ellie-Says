# 🎙️ Ellie Says – Learn Hebrew the Fun Way!

![React](https://img.shields.io/badge/Built%20with-React-blue) ![Next.js](https://img.shields.io/badge/Framework-Next.js-black?logo=next.js&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/Styled%20with-TailwindCSS-teal) ![Firebase](https://img.shields.io/badge/Backend-Firebase-orange) ![AI-Powered](https://img.shields.io/badge/AI-Google%20Gemini-yellow)

<div align="left" style="display: flex; align-items: flex-start; gap: 16px;">

  <img src="my-app/public/Ellie_icon.png" alt="Ellie-Says logo" width="150" style="margin-top: 8px;"/>

  <div style="
    background: #f0f4fa;
    border-radius: 18px 18px 18px 0;
    padding: 16px 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    font-size: 1.08em;
    color: #222;
    max-width: 420px;
    position: relative;
    margin-left: 0;
    ">
    <span style="font-size: 1.1em;">
      “Ellie Says” is more than just a phrase - it's a <b>personal language coach</b> powered by games, AI, and your motivation 🐘
    </span>
    <svg width="16" height="24" viewBox="0 0 16 24" style="position: absolute; left: -16px; top: 24px;">
      <polygon points="0,12 16,0 16,24" fill="#f0f4fa"/>
    </svg>
  </div>

</div>

## 🧠 Overview
**Ellie Says** is an interactive web application that makes learning **Hebrew** engaging, effective, and enjoyable. Through a series of **gamified lessons**, real-time **AI translations**, and **personal progress tracking**, learners of all levels can build vocabulary and master essential phrases.

---

## ✨ Features

- 🎮 **Multiple Game Modes** (Trivia, Word Match, Photo Word)
- 🤖 **AI-Powered Translation Tool** (Google Gemini)
- 📈 **Progress Tracking & Achievements**
- 🔒 **Authentication via Email/Google**
- 🧑‍🎓 **Guest Mode with Limited Access**
- 🎨 **Responsive, Modern UI** (React + Next.js + TailwindCSS)

---

## 📚 Table of Contents

- [🎙️ Ellie Says – Learn Hebrew the Fun Way!](#️-ellie-says--learn-hebrew-the-fun-way)
  - [🧠 Overview](#-overview)
  - [✨ Features](#-features)
  - [📚 Table of Contents](#-table-of-contents)
  - [🚀 Try it out](#-try-it-out)
  - [🧩 Project Architecture](#-project-architecture)
  - [🛠️ Tech Stack](#️-tech-stack)
  - [🚧 Getting Started](#-getting-started)
  - [🖼️ Screenshots](#️-screenshots)
  - [👨‍💻 Authors](#-authors)

---

## 🚀 Try it out 

[🔗 Try Ellie Says Online](https://ellie-says.vercel.app/translate) 

---

## 🧩 Project Architecture

```

/src
├── app/
│   ├── games/              # Game modes (Trivia, Word Match, Photo Word)
│   ├── profile/            # User statistics, saved words, achievements
│   ├── translate/          # AI-powered translation page
│   └── contact/            # Contact & feedback form
├── components/             # Reusable UI components
├── data/                   # Static fallback content
├── lib/
│   ├── gemini.ts           # Google Gemini AI integration
│   └── ThemeContext.tsx    # Dark/light theme context
├── utils/                  # Utility functions
└── firebase.tsx            # Firebase configuration
```

---

## 🛠️ Tech Stack

| Category         | Technologies                         |
|------------------|--------------------------------------|
| **Frontend**     | React, Next.js, Tailwind CSS         |
| **Backend**      | Firebase Firestore, Firebase Auth    |
| **AI**           | Google Gemini API                    |
| **Auth**         | Firebase Email/Password + Google     |
| **Storage**      | Firestore for user data and results  |
| **Deployment**   | Vercel               |

---

## 🚧 Getting Started


```bash
### 1. Clone the project
git clone https://github.com/almograz1/Ellie-Says.git
cd ellie-says

### 2. Install dependencies
npm install

### 3. Configure Firebase
Set up your `.env.local`.

### 4. Run the app
npm run dev
```

---

## 🖼️ Screenshots

| Game Modes                                                        | Translation                                                           | Profile                                                          |
| ----------------------------------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------- |
| ![game](https://via.placeholder.com/200x120.png?text=Trivia+Game) | ![translate](https://via.placeholder.com/200x120.png?text=Translator) | ![profile](https://via.placeholder.com/200x120.png?text=Profile) |

---

## 👨‍💻 Authors

This project is developed by:

<table>
    <table>
        <tr>
            <td><b>Almog Raz</b></td>
            <td>
                <a href="https://www.linkedin.com/in/almog-raz/">
                    <img src="https://img.shields.io/badge/LinkedIn-Profile-blue?style=flat&logo=linkedin" alt="LinkedIn" height="24"/>
                </a>
            </td>
            <td>
                <a href="https://github.com/almograz1">
                    <img src="https://img.shields.io/badge/GitHub-Profile-black?style=flat&logo=github" alt="GitHub" height="24"/>
                </a>
            </td>
        </tr>
        <tr>
            <td><b>Ron Salama</b></td>
            <td>
                <a href="https://www.linkedin.com/in/ron-salama-3860a0107/">
                    <img src="https://img.shields.io/badge/LinkedIn-Profile-blue?style=flat&logo=linkedin" alt="LinkedIn" height="24"/>
                </a>
            </td>
            <td>
                <a href="https://github.com/RS-OG">
                    <img src="https://img.shields.io/badge/GitHub-Profile-black?style=flat&logo=github" alt="GitHub" height="24"/>
                </a>
            </td>
        </tr>
        <tr>
            <td><b>Yaniv Bodaga</b></td>
            <td>
                <a href="https://www.linkedin.com/in/yaniv-bodaga/">
                    <img src="https://img.shields.io/badge/LinkedIn-Profile-blue?style=flat&logo=linkedin" alt="LinkedIn" height="24"/>
                </a>
            </td>
            <td>
                <a href="https://github.com/yaniv99">
                    <img src="https://img.shields.io/badge/GitHub-Profile-black?style=flat&logo=github" alt="GitHub" height="24"/>
                </a>
            </td>
        </tr>
        <tr>
            <td><b>Yuval Kogan</b></td>
            <td>
                <a href="https://www.linkedin.com/in/yuval-kogan">
                    <img src="https://img.shields.io/badge/LinkedIn-Profile-blue?style=flat&logo=linkedin" alt="LinkedIn" height="24"/>
                </a>
            </td>
            <td>
                <a href="https://github.com/KoganTheDev">
                    <img src="https://img.shields.io/badge/GitHub-Profile-black?style=flat&logo=github" alt="GitHub" height="24"/>
                </a>
            </td>
        </tr>
        <tr>
            <td><b>Daniel Lachmakov</b></td>
            <td>
                <a href="https://www.linkedin.com/in/daniel-lachmakov-94761b288/">
                    <img src="https://img.shields.io/badge/LinkedIn-Profile-blue?style=flat&logo=linkedin" alt="LinkedIn" height="24"/>
                </a>
            </td>
            <td>
                <a href="https://github.com/Danielon05423">
                    <img src="https://img.shields.io/badge/GitHub-Profile-black?style=flat&logo=github" alt="GitHub" height="24"/>
                </a>
            </td>
        </tr>
        <tr>
            <td><b>Lior Dagash</b></td>
            <td>
                <a href="https://www.linkedin.com/in/lior-dagash-53130333a/">
                    <img src="https://img.shields.io/badge/LinkedIn-Profile-blue?style=flat&logo=linkedin" alt="LinkedIn" height="24"/>
                </a>
            </td>
            <td>
                <a href="https://github.com/iMianite">
                    <img src="https://img.shields.io/badge/GitHub-Profile-black?style=flat&logo=github" alt="GitHub" height="24"/>
                </a>
            </td>
        </tr>
    </table>

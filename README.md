# 🍽️ AI Recipe Generator App

A full-stack AI-powered cooking assistant that helps you manage your pantry, generate smart recipes, plan meals, and build shopping lists — all in one place.

---

## ✨ Features

- 🔐 **User Authentication** — Secure signup & login with JWT and encrypted passwords
- 🥦 **Smart Pantry Management** — Track ingredients, quantities, and get alerts for items expiring within 7 days
- 🤖 **AI Recipe Generation** — Generate custom recipes using Google Gemini 2.5 Flash based on your pantry or manual inputs
- 🌮 **Dietary & Cuisine Filters** — Filter by cuisine (Italian, Mexican, etc.) and dietary needs (Vegan, Keto, Gluten-Free, etc.)
- 📖 **Recipe Collection** — Save, search, and view full recipes with step-by-step instructions and AI cooking tips
- 📅 **Meal Planner** — Weekly calendar to organize breakfast, lunch, and dinner for each day
- ⚙️ **User Profile & Settings** — Update account info, change password, set dietary preferences, or delete account

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL

### Installation

```bash
# Clone the repo
git clone https://github.com/Ayush-Chovatiya/ai-recipe-generator-app.git
cd ai-recipe-generator-app

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

Add your Gemini API key, JWT secret, and database URL to a `.env` file in `backend/`, then run:

```bash
# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm start
```

Open [http://localhost:3000](http://localhost:3000) to use the app.

---

## 👤 Author

**Ayush Chovatiya** — [@Ayush-Chovatiya](https://github.com/Ayush-Chovatiya)

> ⭐ If you found this useful, drop a star!

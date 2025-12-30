# 📚 StudyWithMe - AI-Powered Learning Platform

An intelligent study companion powered by Google Gemini AI. Features adaptive learning, flashcards with spaced repetition, AI-generated quizzes, and comprehensive gamification.

![StudyWithMe](https://img.shields.io/badge/React-19.2-blue) ![Node](https://img.shields.io/badge/Node-18+-green) ![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue) ![Gemini](https://img.shields.io/badge/Gemini-AI-orange)

## ✨ Features

### 🤖 AI Chat
- Complete, detailed answers - never truncated
- Supports code, math, science, and general knowledge
- Image understanding capability
- Voice input support

### 🎮 Gamification
- XP points for all activities
- 10 levels from "Curious Beginner" to "Grand Sage"
- Daily streaks with freeze protection
- Customizable daily study goals

### 📚 Flashcards
- SM-2 spaced repetition algorithm
- Create custom decks
- AI-generated flashcards
- 4-tier rating system

### 🧠 Quiz Mode
- AI-generated quizzes on any topic
- Multiple difficulty levels
- Timed challenges
- Detailed score breakdown

### ⚙️ Settings
- Dark/Light/System themes
- Font size customization
- High contrast mode
- Text-to-speech

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- Google Gemini API Key ([Get one here](https://aistudio.google.com/apikey))

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/studywithme.git
cd studywithme

# Install backend dependencies
cd backend
npm install
cp .env.example .env
# Edit .env and add your API_KEY

# Install frontend dependencies
cd ../frontend
npm install
```

### Run Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

Open http://localhost:5173 in your browser.

---

## 🌐 Deployment Guide

### Option 1: Render (Backend) + Vercel (Frontend) - **Recommended**

#### Step 1: Deploy Backend to Render

1. **Create a Render account** at [render.com](https://render.com)

2. **Create New Web Service**
   - Connect your GitHub repository
   - Select the `backend` folder as root directory

3. **Configure Build Settings:**
   ```
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

4. **Set Environment Variables:**
   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `API_KEY` | Your Gemini API Key |
   | `FRONTEND_URL` | (set after deploying frontend) |

5. **Deploy** - Note your backend URL (e.g., `https://studywithme-backend.onrender.com`)

#### Step 2: Deploy Frontend to Vercel

1. **Create a Vercel account** at [vercel.com](https://vercel.com)

2. **Import Project**
   - Connect your GitHub repository
   - Set `frontend` as the root directory

3. **Configure Build Settings:**
   ```
   Build Command: npm run build
   Output Directory: dist
   ```

4. **Set Environment Variables:**
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://your-backend.onrender.com/api` |

5. **Deploy** - Note your frontend URL

#### Step 3: Update Backend CORS

Go back to Render and update the `FRONTEND_URL` environment variable with your Vercel URL.

---

### Option 2: Railway (Full Stack)

1. **Create Railway account** at [railway.app](https://railway.app)

2. **Deploy Backend:**
   ```bash
   cd backend
   railway login
   railway init
   railway up
   railway variables set API_KEY=your_key
   railway variables set NODE_ENV=production
   ```

3. **Deploy Frontend:**
   ```bash
   cd frontend
   railway init
   railway up
   railway variables set VITE_API_URL=https://your-backend.railway.app/api
   ```

---

### Option 3: Docker (Self-Hosted)

```dockerfile
# Backend Dockerfile (backend/Dockerfile)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```dockerfile
# Frontend Dockerfile (frontend/Dockerfile)
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# Build and run
docker build -t studywithme-backend ./backend
docker build -t studywithme-frontend --build-arg VITE_API_URL=http://localhost:3000/api ./frontend

docker run -d -p 3000:3000 -e API_KEY=your_key studywithme-backend
docker run -d -p 80:80 studywithme-frontend
```

---

## 📁 Project Structure

```
StudyWithMe/
├── backend/                 # Express.js API Server
│   ├── server.ts           # Main server entry
│   ├── src/
│   │   ├── ai/             # Gemini AI integration
│   │   ├── controllers/    # Route handlers
│   │   └── types/          # TypeScript types
│   └── package.json
│
├── frontend/               # React + Vite Frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── store/          # State management
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   └── config/         # Configuration
│   └── package.json
│
└── README.md
```

---

## 🔒 Environment Variables

### Backend (.env)
```env
API_KEY=your_gemini_api_key      # Required
PORT=3000                         # Optional
NODE_ENV=production               # production/development
FRONTEND_URL=https://your.app     # For CORS
```

### Frontend (.env)
```env
VITE_API_URL=https://api.your.app/api
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Backend | Node.js, Express 5 |
| AI | Google Gemini 1.5 |
| Rendering | React Markdown |

---

## 📜 License

MIT License - feel free to use this project for learning or production.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

**Built with ❤️ for students everywhere**

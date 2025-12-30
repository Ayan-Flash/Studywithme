// Backend Server - Production Ready
// Express.js server with all API endpoints

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import { chatController } from './src/controllers/chat.controller';
import { assignmentController } from './src/controllers/assignment.controller';
import { dashboardController } from './src/controllers/dashboard.controller';
import { progressController } from './src/controllers/progress.controller';
import { DepthLevel, TaskMode } from './src/types/index';

// Load environment variables
dotenv.config();

const app = express();

// ============ ENVIRONMENT ============
const PORT = parseInt(process.env.PORT || '3000', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';
const API_KEY = process.env.API_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

console.log(`[Server] Environment: ${NODE_ENV}`);
console.log(`[Server] Port: ${PORT}`);
console.log(`[Server] Frontend URL: ${FRONTEND_URL}`);

// ============ MIDDLEWARE ============

// CORS Configuration
const corsOptions = {
    origin: NODE_ENV === 'production'
        ? [FRONTEND_URL, /\.vercel\.app$/, /\.netlify\.app$/]
        : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};
app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging (production-safe)
app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
    });
    next();
});

// ============ API KEY VALIDATION ============
if (!API_KEY) {
    console.error("⚠️  WARNING: API_KEY is missing in environment variables");
    console.error("   Set API_KEY in .env file or environment");
} else {
    console.log("✅ API_KEY loaded successfully");
    chatController.initialize(API_KEY);
    assignmentController.initialize(API_KEY);
}

// ============ HEALTH CHECK ============
app.get('/api/health', (req: Request, res: Response) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: NODE_ENV,
        version: '1.0.0'
    });
});

// ============ CHAT ENDPOINT ============
app.post('/api/chat', async (req: Request, res: Response) => {
    try {
        const { message, depth, mode, image } = req.body;

        if (!message && !image) {
            return res.status(400).json({ error: 'Message or image is required' });
        }

        const result = await chatController.handleChat(message, depth, mode, image);
        res.json(result);
    } catch (error: any) {
        console.error("[Chat Error]", error);
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
});

// ============ ASSIGNMENT ENDPOINTS ============
app.post('/api/assignment/generate', async (req: Request, res: Response) => {
    try {
        const { topic, depth } = req.body;

        if (!topic) {
            return res.status(400).json({ success: false, error: 'Topic is required' });
        }

        const result = await assignmentController.generate(topic, depth);
        res.json({ success: true, data: result });
    } catch (error: any) {
        console.error("[Assignment Generate Error]", error);
        res.status(500).json({ success: false, error: error.message || "Failed to generate assignment" });
    }
});

app.post('/api/assignment/evaluate', async (req: Request, res: Response) => {
    try {
        const { assignment, answer } = req.body;

        if (!assignment || !answer) {
            return res.status(400).json({ success: false, error: 'Assignment and answer are required' });
        }

        const result = await assignmentController.evaluate(assignment, answer);
        res.json({ success: true, data: result });
    } catch (error: any) {
        console.error("[Assignment Evaluate Error]", error);
        res.status(500).json({ success: false, error: error.message || "Failed to evaluate" });
    }
});

// ============ DASHBOARD ENDPOINT ============
app.get('/api/dashboard/metrics', async (req: Request, res: Response) => {
    try {
        const result = await dashboardController.getDashboardMetrics();
        res.json({ success: true, data: result });
    } catch (error: any) {
        console.error("[Dashboard Error]", error);
        res.status(500).json({ success: false, error: error.message || "Failed to get metrics" });
    }
});

// ============ PROGRESS ENDPOINTS ============
app.post('/api/progress/update', async (req: Request, res: Response) => {
    try {
        const event = req.body;
        const result = await progressController.trackProgress(event);
        res.json({ success: true, data: result });
    } catch (error: any) {
        console.error("[Progress Update Error]", error);
        res.status(500).json({ success: false, error: "Failed to update progress" });
    }
});

app.get('/api/progress/summary/:studentId', async (req: Request, res: Response) => {
    try {
        const { studentId } = req.params;
        const result = await progressController.getProgressSummary(studentId);
        res.json({ success: true, data: result });
    } catch (error: any) {
        console.error("[Progress Summary Error]", error);
        res.status(500).json({ success: false, error: "Failed to get summary" });
    }
});

// ============ QUIZ GENERATION ENDPOINT ============
app.post('/api/quiz/generate', async (req: Request, res: Response) => {
    try {
        const { topic, questionCount = 5, difficulty = 'medium' } = req.body;

        if (!topic) {
            return res.status(400).json({ success: false, error: 'Topic is required' });
        }

        const prompt = `Generate a quiz about "${topic}" with exactly ${questionCount} multiple choice questions at ${difficulty} difficulty level.

IMPORTANT: Format each question EXACTLY like this:

1. [Question text here]?
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
Answer: [A, B, C, or D]

2. [Next question]?
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
Answer: [A, B, C, or D]

Generate exactly ${questionCount} questions about "${topic}" now. Make questions educational and appropriate for ${difficulty} difficulty:`;

        const result = await chatController.handleChat(prompt, DepthLevel.Core, TaskMode.Learning);

        res.json({
            success: true,
            data: {
                topic,
                rawQuestions: result.text,
                questionCount,
                difficulty
            }
        });
    } catch (error: any) {
        console.error("[Quiz Generate Error]", error);
        res.status(500).json({ success: false, error: "Quiz generation failed" });
    }
});

// ============ FLASHCARD GENERATION ENDPOINT ============
app.post('/api/flashcard/generate', async (req: Request, res: Response) => {
    try {
        const { topic, count = 5 } = req.body;

        if (!topic) {
            return res.status(400).json({ success: false, error: 'Topic is required' });
        }

        const prompt = `Create ${count} flashcards about "${topic}".

Format each flashcard EXACTLY like this:

FRONT: [Question or term to memorize]
BACK: [Answer or definition]

---

FRONT: [Next question or term]
BACK: [Answer or definition]

---

Generate ${count} flashcards about "${topic}" now:`;

        const result = await chatController.handleChat(prompt, DepthLevel.Core, TaskMode.Learning);

        res.json({
            success: true,
            data: {
                topic,
                rawCards: result.text
            }
        });
    } catch (error: any) {
        console.error("[Flashcard Generate Error]", error);
        res.status(500).json({ success: false, error: "Flashcard generation failed" });
    }
});

// ============ STATIC FILE SERVING (PRODUCTION) ============
if (NODE_ENV === 'production') {
    const staticPath = path.join(__dirname, '../frontend/dist');
    app.use(express.static(staticPath));

    // SPA fallback
    app.get('*', (req: Request, res: Response) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(staticPath, 'index.html'));
        }
    });
}

// ============ ERROR HANDLER ============
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('[Error Handler]', err);
    res.status(500).json({
        error: NODE_ENV === 'production' ? 'Internal Server Error' : err.message
    });
});

// ============ START SERVER ============
app.listen(PORT, () => {
    console.log(`\n🚀 StudyWithMe Backend Server`);
    console.log(`   Environment: ${NODE_ENV}`);
    console.log(`   Running on: http://localhost:${PORT}`);
    console.log(`   API Health: http://localhost:${PORT}/api/health\n`);
});

export default app;

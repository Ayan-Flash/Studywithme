// API Service Layer - Production Ready
// Handles all communication with the backend

import { DepthLevel, TaskMode, AssignmentStructure, AssignmentFeedback, DashboardMetrics } from '../types/index.ts';
import config from '../config/index.ts';

const API_URL = config.API_URL;

// ============ TYPES ============
interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

interface ChatResponse {
    text: string;
    ethicsFlag: boolean;
    error?: string;
}

// Helper for API requests with error handling
async function apiRequest<T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: response.statusText }));
            throw new Error(error.error || `HTTP ${response.status}`);
        }

        return await response.json();
    } catch (error: any) {
        console.error(`API Error [${endpoint}]:`, error);
        throw error;
    }
}

// ============ CHAT ROUTES ============
export const ChatRoutes = {
    initialize: (_apiKey: string) => {
        // No-op for frontend - API key is stored on backend
    },

    sendMessage: async (
        message: string,
        depth: DepthLevel,
        mode: TaskMode,
        image?: { data: string; mimeType: string }
    ): Promise<ChatResponse> => {
        try {
            return await apiRequest<ChatResponse>(
                '/chat',
                {
                    method: 'POST',
                    body: JSON.stringify({ message, depth, mode, image })
                }
            );
        } catch (e: any) {
            return { text: "Error connecting to server", ethicsFlag: false, error: e.message };
        }
    }
};

// ============ ASSIGNMENT ROUTES ============
export const AssignmentRoutes = {
    initialize: (_apiKey: string) => { },

    generate: async (topic: string, depth: DepthLevel): Promise<ApiResponse<AssignmentStructure>> => {
        try {
            return await apiRequest<ApiResponse<AssignmentStructure>>(
                '/assignment/generate',
                {
                    method: 'POST',
                    body: JSON.stringify({ topic, depth })
                }
            );
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    },

    evaluate: async (assignment: AssignmentStructure, answer: string): Promise<ApiResponse<AssignmentFeedback>> => {
        try {
            return await apiRequest<ApiResponse<AssignmentFeedback>>(
                '/assignment/evaluate',
                {
                    method: 'POST',
                    body: JSON.stringify({ assignment, answer })
                }
            );
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    }
};

// ============ DASHBOARD ROUTES ============
export const DashboardRoutes = {
    getMetrics: async (): Promise<ApiResponse<DashboardMetrics>> => {
        try {
            return await apiRequest<ApiResponse<DashboardMetrics>>(
                '/dashboard/metrics'
            );
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    }
};

// ============ PROGRESS ROUTES ============
export const ProgressRoutes = {
    updateProgress: async (event: any): Promise<ApiResponse<void>> => {
        try {
            return await apiRequest<ApiResponse<void>>(
                '/progress/update',
                {
                    method: 'POST',
                    body: JSON.stringify(event)
                }
            );
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    },

    getSummary: async (studentId: string): Promise<ApiResponse<any>> => {
        try {
            return await apiRequest<ApiResponse<any>>(
                `/progress/summary/${studentId}`
            );
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    }
};

// ============ QUIZ ROUTES ============
interface QuizGenerationResponse {
    topic: string;
    rawQuestions: string;
    questionCount: number;
    difficulty: string;
}

export const QuizRoutes = {
    generate: async (topic: string, questionCount: number, difficulty: string): Promise<ApiResponse<QuizGenerationResponse>> => {
        try {
            return await apiRequest<ApiResponse<QuizGenerationResponse>>(
                '/quiz/generate',
                {
                    method: 'POST',
                    body: JSON.stringify({ topic, questionCount, difficulty })
                }
            );
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    }
};

// ============ FLASHCARD ROUTES ============
interface FlashcardGenerationResponse {
    topic: string;
    rawCards: string;
}

export const FlashcardRoutes = {
    generate: async (topic: string, count: number): Promise<ApiResponse<FlashcardGenerationResponse>> => {
        try {
            return await apiRequest<ApiResponse<FlashcardGenerationResponse>>(
                '/flashcard/generate',
                {
                    method: 'POST',
                    body: JSON.stringify({ topic, count })
                }
            );
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    }
};

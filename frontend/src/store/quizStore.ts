// Quiz Store - Production Quality
// Handles quiz creation, storage, attempts, and scoring

import { Quiz, QuizQuestion, QuizAttempt } from '../types/features.types.ts';
import { userStore } from './userStore.ts';

const STORAGE_KEY = 'studywithme_quizzes';
const ATTEMPTS_KEY = 'studywithme_quiz_attempts';

class QuizStore {
    private quizzes: Map<string, Quiz> = new Map();
    private attempts: QuizAttempt[] = [];
    private listeners: Set<() => void> = new Set();
    private initialized: boolean = false;

    constructor() {
        this.loadFromStorage();
    }

    // ============ STORAGE ============
    private loadFromStorage(): void {
        try {
            const quizzesJson = localStorage.getItem(STORAGE_KEY);
            const attemptsJson = localStorage.getItem(ATTEMPTS_KEY);

            if (quizzesJson) {
                const quizzesArray: Quiz[] = JSON.parse(quizzesJson);
                quizzesArray.forEach(q => this.quizzes.set(q.id, q));
            }

            if (attemptsJson) {
                this.attempts = JSON.parse(attemptsJson);
            }

            this.initialized = true;
        } catch (e) {
            console.error('QuizStore: Failed to load from storage', e);
            this.quizzes = new Map();
            this.attempts = [];
            this.initialized = true;
        }
    }

    private saveToStorage(): void {
        try {
            const quizzesArray = Array.from(this.quizzes.values());
            localStorage.setItem(STORAGE_KEY, JSON.stringify(quizzesArray));
            localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(this.attempts));
        } catch (e) {
            console.error('QuizStore: Failed to save to storage', e);
        }
    }

    private notify(): void {
        this.listeners.forEach(fn => fn());
    }

    // ============ SUBSCRIPTIONS ============
    subscribe(fn: () => void): () => boolean {
        this.listeners.add(fn);
        return () => this.listeners.delete(fn);
    }

    // ============ QUIZ MANAGEMENT ============
    getQuizzes(): Quiz[] {
        return Array.from(this.quizzes.values());
    }

    getQuiz(id: string): Quiz | undefined {
        return this.quizzes.get(id);
    }

    /**
     * Registers a quiz in the store. Must be called before submitAttempt.
     */
    registerQuiz(quiz: Quiz): Quiz {
        if (!quiz.id) {
            quiz.id = 'quiz_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        this.quizzes.set(quiz.id, quiz);
        this.saveToStorage();
        this.notify();
        return quiz;
    }

    /**
     * Creates and registers a new quiz
     */
    createQuiz(title: string, topic: string, questions: QuizQuestion[], timeLimit?: number): Quiz {
        const quiz: Quiz = {
            id: 'quiz_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            title,
            topic,
            questions,
            timeLimit,
            createdAt: Date.now()
        };
        return this.registerQuiz(quiz);
    }

    deleteQuiz(id: string): boolean {
        const deleted = this.quizzes.delete(id);
        if (deleted) {
            // Also remove related attempts
            this.attempts = this.attempts.filter(a => a.quizId !== id);
            this.saveToStorage();
            this.notify();
        }
        return deleted;
    }

    // ============ QUIZ ATTEMPTS ============
    /**
     * Submit a quiz attempt and calculate score
     */
    submitAttempt(quizId: string, answers: Record<string, string>, timeTaken: number): QuizAttempt {
        // First check if quiz exists in store
        let quiz = this.quizzes.get(quizId);

        if (!quiz) {
            console.error(`QuizStore: Quiz ${quizId} not found in store`);
            throw new Error(`Quiz not found. Quiz ID: ${quizId}`);
        }

        // Calculate score
        let correctCount = 0;
        const questionResults: { questionId: string; correct: boolean; userAnswer: string; correctAnswer: string }[] = [];

        for (const question of quiz.questions) {
            const userAnswer = answers[question.id] || '';
            const isCorrect = this.compareAnswers(userAnswer, question.correctAnswer);

            if (isCorrect) {
                correctCount++;
            }

            questionResults.push({
                questionId: question.id,
                correct: isCorrect,
                userAnswer,
                correctAnswer: question.correctAnswer
            });
        }

        const attempt: QuizAttempt = {
            quizId,
            answers,
            score: correctCount,
            totalQuestions: quiz.questions.length,
            timeTaken,
            completedAt: Date.now()
        };

        this.attempts.push(attempt);
        this.saveToStorage();
        this.notify();

        // Award XP based on percentage score
        const percentage = (correctCount / quiz.questions.length) * 100;
        let xpReward = 10; // Base XP for completing

        if (percentage >= 90) xpReward = 50;
        else if (percentage >= 80) xpReward = 40;
        else if (percentage >= 70) xpReward = 30;
        else if (percentage >= 50) xpReward = 20;

        userStore.addXP(xpReward, 'quiz_completed');

        console.log(`QuizStore: Attempt submitted. Score: ${correctCount}/${quiz.questions.length} (${percentage.toFixed(1)}%). XP: +${xpReward}`);

        return attempt;
    }

    /**
     * Compare answers with normalization
     */
    private compareAnswers(userAnswer: string, correctAnswer: string): boolean {
        if (!userAnswer || !correctAnswer) return false;

        // Normalize both answers
        const normalize = (s: string): string => {
            return s
                .toLowerCase()
                .trim()
                .replace(/\s+/g, ' ')
                .replace(/[^\w\s\[\]{}(),.:;]/g, '');
        };

        return normalize(userAnswer) === normalize(correctAnswer);
    }

    getAttempts(quizId?: string): QuizAttempt[] {
        if (quizId) {
            return this.attempts.filter(a => a.quizId === quizId);
        }
        return [...this.attempts];
    }

    getBestScore(quizId: string): number {
        const quizAttempts = this.getAttempts(quizId);
        if (quizAttempts.length === 0) return 0;
        return Math.max(...quizAttempts.map(a => (a.score / a.totalQuestions) * 100));
    }

    getTotalQuizzesCompleted(): number {
        return this.attempts.length;
    }

    getAverageScore(): number {
        if (this.attempts.length === 0) return 0;
        const totalPercentage = this.attempts.reduce((sum, a) => {
            return sum + (a.score / a.totalQuestions) * 100;
        }, 0);
        return totalPercentage / this.attempts.length;
    }

    // ============ DEBUG ============
    debugPrintState(): void {
        console.log('QuizStore State:');
        console.log('  Quizzes:', this.quizzes.size);
        this.quizzes.forEach((q, id) => {
            console.log(`    - ${id}: "${q.title}" (${q.questions.length} questions)`);
        });
        console.log('  Attempts:', this.attempts.length);
    }
}

export const quizStore = new QuizStore();

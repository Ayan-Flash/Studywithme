// ============ AUTHENTICATION & PROFILES ============
export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: 'student' | 'teacher' | 'parent';
    createdAt: number;
    preferences: UserPreferences;
    streak: StreakData;
    xp: XPData;
    level: number;
}

export interface UserPreferences {
    theme: 'light' | 'dark' | 'system';
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
    voiceEnabled: boolean;
    learningStyle: 'visual' | 'verbal' | 'kinesthetic' | 'auto';
    dailyGoalMinutes: number;
    notifications: boolean;
}

// ============ GAMIFICATION ============
export interface StreakData {
    current: number;
    longest: number;
    lastActiveDate: string;
    freezesAvailable: number;
    freezesUsed: number;
}

export interface XPData {
    total: number;
    today: number;
    thisWeek: number;
    history: { date: string; amount: number }[];
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    xpReward: number;
    unlockedAt?: number;
    progress?: number;
    target?: number;
}

export interface Challenge {
    id: string;
    title: string;
    description: string;
    type: 'daily' | 'weekly' | 'special';
    xpReward: number;
    progress: number;
    target: number;
    expiresAt: number;
}

export const LEVEL_THRESHOLDS = [
    0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000,
    17000, 23000, 30000, 40000, 52000, 67000, 85000, 110000
];

export const LEVEL_NAMES = [
    'Curious Beginner', 'Eager Learner', 'Rising Star', 'Knowledge Seeker',
    'Quick Thinker', 'Dedicated Scholar', 'Master Student', 'Wisdom Keeper',
    'Enlightened Mind', 'Grand Sage'
];

// ============ FLASHCARDS ============
export interface Flashcard {
    id: string;
    front: string;
    back: string;
    topic: string;
    createdAt: number;
    nextReviewAt: number;
    interval: number; // days
    easeFactor: number;
    repetitions: number;
    lastReviewedAt?: number;
}

export interface FlashcardDeck {
    id: string;
    name: string;
    description?: string;
    cards: Flashcard[];
    createdAt: number;
    color: string;
}

// ============ QUIZ ============
export interface QuizQuestion {
    id: string;
    type: 'mcq' | 'fill-blank' | 'short-answer' | 'true-false';
    question: string;
    options?: string[];
    correctAnswer: string;
    explanation?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    topic: string;
}

export interface Quiz {
    id: string;
    title: string;
    topic: string;
    questions: QuizQuestion[];
    timeLimit?: number; // seconds
    createdAt: number;
}

export interface QuizAttempt {
    quizId: string;
    answers: Record<string, string>;
    score: number;
    totalQuestions: number;
    timeTaken: number;
    completedAt: number;
}

// ============ STUDY SESSIONS ============
export interface StudySession {
    id: string;
    startedAt: number;
    endedAt?: number;
    topic?: string;
    messagesCount: number;
    xpEarned: number;
}

export interface StudyGoal {
    id: string;
    type: 'daily' | 'weekly';
    targetMinutes: number;
    currentMinutes: number;
    startDate: string;
    endDate: string;
}

// ============ NOTES & EXPORT ============
export interface StudyNote {
    id: string;
    title: string;
    content: string;
    topic: string;
    tags: string[];
    createdAt: number;
    updatedAt: number;
    fromConversation?: string;
}

// ============ CLASSROOM ============
export interface Classroom {
    id: string;
    name: string;
    description?: string;
    teacherId: string;
    studentIds: string[];
    createdAt: number;
    inviteCode: string;
}

export interface ClassAssignment {
    id: string;
    classroomId: string;
    title: string;
    description: string;
    topic: string;
    dueDate: number;
    status: 'pending' | 'submitted' | 'graded';
    grade?: number;
    feedback?: string;
}

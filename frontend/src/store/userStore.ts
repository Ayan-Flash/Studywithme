import { User, UserPreferences, StreakData, XPData, Achievement, Challenge, LEVEL_THRESHOLDS, StudySession } from '../types/features.types.ts';

const STORAGE_KEY = 'studywithme_user';
const SESSION_KEY = 'studywithme_session';

// Default user for guest mode
const createGuestUser = (): User => ({
    id: 'guest_' + Date.now(),
    name: 'Guest Learner',
    email: '',
    role: 'student',
    createdAt: Date.now(),
    preferences: {
        theme: 'dark',
        fontSize: 'medium',
        highContrast: false,
        voiceEnabled: true,
        learningStyle: 'auto',
        dailyGoalMinutes: 30,
        notifications: true
    },
    streak: {
        current: 0,
        longest: 0,
        lastActiveDate: '',
        freezesAvailable: 2,
        freezesUsed: 0
    },
    xp: {
        total: 0,
        today: 0,
        thisWeek: 0,
        history: []
    },
    level: 1
});

class UserStore {
    private user: User | null = null;
    private currentSession: StudySession | null = null;
    private listeners: Set<() => void> = new Set();

    constructor() {
        this.loadFromStorage();
        this.startSession();
    }

    private loadFromStorage() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                this.user = JSON.parse(stored);
                this.checkStreak();
            } else {
                this.user = createGuestUser();
                this.saveToStorage();
            }
        } catch (e) {
            this.user = createGuestUser();
        }
    }

    private saveToStorage() {
        if (this.user) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.user));
        }
    }

    private notify() {
        this.listeners.forEach(fn => fn());
    }

    subscribe(fn: () => void) {
        this.listeners.add(fn);
        return () => this.listeners.delete(fn);
    }

    getUser(): User | null {
        return this.user;
    }

    // ============ STREAK MANAGEMENT ============
    private checkStreak() {
        if (!this.user) return;

        const today = new Date().toISOString().split('T')[0];
        const lastActive = this.user.streak.lastActiveDate;

        if (!lastActive) {
            this.user.streak.current = 1;
            this.user.streak.lastActiveDate = today;
        } else {
            const lastDate = new Date(lastActive);
            const todayDate = new Date(today);
            const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
                // Same day, no change
            } else if (diffDays === 1) {
                // Consecutive day
                this.user.streak.current++;
                this.user.streak.lastActiveDate = today;
                if (this.user.streak.current > this.user.streak.longest) {
                    this.user.streak.longest = this.user.streak.current;
                }
            } else if (diffDays > 1) {
                // Streak broken
                if (this.user.streak.freezesAvailable > 0 && diffDays <= 2) {
                    this.user.streak.freezesAvailable--;
                    this.user.streak.freezesUsed++;
                } else {
                    this.user.streak.current = 1;
                }
                this.user.streak.lastActiveDate = today;
            }
        }

        this.saveToStorage();
    }

    // ============ XP SYSTEM ============
    addXP(amount: number, reason?: string) {
        if (!this.user) return;

        const today = new Date().toISOString().split('T')[0];

        this.user.xp.total += amount;
        this.user.xp.today += amount;
        this.user.xp.thisWeek += amount;

        // Add to history
        const todayEntry = this.user.xp.history.find(h => h.date === today);
        if (todayEntry) {
            todayEntry.amount += amount;
        } else {
            this.user.xp.history.push({ date: today, amount });
        }

        // Check for level up
        const newLevel = this.calculateLevel(this.user.xp.total);
        if (newLevel > this.user.level) {
            this.user.level = newLevel;
            // Could trigger level up notification here
        }

        // Update session XP
        if (this.currentSession) {
            this.currentSession.xpEarned += amount;
        }

        this.saveToStorage();
        this.notify();
    }

    private calculateLevel(totalXP: number): number {
        for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
            if (totalXP >= LEVEL_THRESHOLDS[i]) {
                return i + 1;
            }
        }
        return 1;
    }

    getXPForNextLevel(): { current: number; needed: number; progress: number } {
        if (!this.user) return { current: 0, needed: 100, progress: 0 };

        const currentThreshold = LEVEL_THRESHOLDS[this.user.level - 1] || 0;
        const nextThreshold = LEVEL_THRESHOLDS[this.user.level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];

        const current = this.user.xp.total - currentThreshold;
        const needed = nextThreshold - currentThreshold;
        const progress = Math.min((current / needed) * 100, 100);

        return { current, needed, progress };
    }

    // ============ SESSION MANAGEMENT ============
    private startSession() {
        this.currentSession = {
            id: 'session_' + Date.now(),
            startedAt: Date.now(),
            messagesCount: 0,
            xpEarned: 0
        };
    }

    incrementMessages() {
        if (this.currentSession) {
            this.currentSession.messagesCount++;
            // Award XP for engagement
            this.addXP(5, 'message');
        }
    }

    getSessionDuration(): number {
        if (!this.currentSession) return 0;
        return Math.floor((Date.now() - this.currentSession.startedAt) / 1000 / 60);
    }

    // ============ PREFERENCES ============
    updatePreferences(prefs: Partial<UserPreferences>) {
        if (!this.user) return;
        this.user.preferences = { ...this.user.preferences, ...prefs };
        this.saveToStorage();
        this.notify();
    }

    // ============ PROFILE ============
    updateProfile(data: Partial<Pick<User, 'name' | 'email' | 'avatar'>>) {
        if (!this.user) return;
        this.user = { ...this.user, ...data };
        this.saveToStorage();
        this.notify();
    }

    // Reset daily/weekly XP (call from cron or on app load)
    resetDailyXP() {
        if (!this.user) return;
        this.user.xp.today = 0;
        this.saveToStorage();
    }
}

export const userStore = new UserStore();

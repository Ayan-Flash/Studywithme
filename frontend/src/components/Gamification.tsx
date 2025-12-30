import React, { useState, useEffect } from 'react';
import { Flame, Trophy, Star, Zap, Target, Crown, Medal, Award, TrendingUp } from 'lucide-react';
import { userStore } from '../store/userStore.ts';
import { LEVEL_NAMES } from '../types/features.types.ts';

export const XPBar: React.FC = () => {
    const [user, setUser] = useState(userStore.getUser());
    const [xpProgress, setXpProgress] = useState(userStore.getXPForNextLevel());

    useEffect(() => {
        const unsubscribe = userStore.subscribe(() => {
            setUser(userStore.getUser());
            setXpProgress(userStore.getXPForNextLevel());
        });
        return () => { unsubscribe(); };
    }, []);

    if (!user) return null;

    return (
        <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 rounded-xl p-4 border border-indigo-500/30">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className="bg-yellow-500/20 p-2 rounded-lg">
                        <Crown className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wider">Level {user.level}</p>
                        <p className="text-sm font-bold text-white">{LEVEL_NAMES[Math.min(user.level - 1, LEVEL_NAMES.length - 1)]}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-lg font-bold text-indigo-400">{user.xp.total.toLocaleString()} XP</p>
                    <p className="text-xs text-slate-500">+{user.xp.today} today</p>
                </div>
            </div>

            <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${xpProgress.progress}%` }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
            </div>
            <p className="text-xs text-slate-500 mt-1 text-center">
                {xpProgress.current} / {xpProgress.needed} XP to next level
            </p>
        </div>
    );
};

export const StreakDisplay: React.FC = () => {
    const [user, setUser] = useState(userStore.getUser());

    useEffect(() => {
        const unsubscribe = userStore.subscribe(() => setUser(userStore.getUser()));
        return () => { unsubscribe(); };
    }, []);

    if (!user) return null;

    const streakColor = user.streak.current >= 7 ? 'text-orange-400' :
        user.streak.current >= 3 ? 'text-yellow-400' : 'text-slate-400';

    return (
        <div className="flex items-center gap-3 bg-slate-800/50 rounded-xl p-3 border border-slate-700">
            <div className={`relative ${user.streak.current > 0 ? 'animate-pulse' : ''}`}>
                <Flame className={`w-8 h-8 ${streakColor}`} />
                {user.streak.current >= 7 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-ping" />
                )}
            </div>
            <div>
                <p className="text-2xl font-bold text-white">{user.streak.current}</p>
                <p className="text-xs text-slate-500">Day Streak</p>
            </div>
            {user.streak.freezesAvailable > 0 && (
                <div className="ml-auto text-xs text-blue-400 flex items-center gap-1">
                    <Zap size={12} />
                    {user.streak.freezesAvailable} freeze{user.streak.freezesAvailable > 1 ? 's' : ''}
                </div>
            )}
        </div>
    );
};

export const StatsGrid: React.FC = () => {
    const [user, setUser] = useState(userStore.getUser());
    const sessionMinutes = userStore.getSessionDuration();

    useEffect(() => {
        const unsubscribe = userStore.subscribe(() => setUser(userStore.getUser()));
        return () => { unsubscribe(); };
    }, []);

    if (!user) return null;

    const stats = [
        { label: 'Today XP', value: user.xp.today, icon: Star, color: 'text-yellow-400' },
        { label: 'Week XP', value: user.xp.thisWeek, icon: TrendingUp, color: 'text-green-400' },
        { label: 'Session', value: `${sessionMinutes}m`, icon: Target, color: 'text-blue-400' },
        { label: 'Best Streak', value: user.streak.longest, icon: Trophy, color: 'text-orange-400' },
    ];

    return (
        <div className="grid grid-cols-2 gap-2">
            {stats.map((stat, i) => (
                <div key={i} className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50 flex items-center gap-2">
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    <div>
                        <p className="text-lg font-bold text-white">{stat.value}</p>
                        <p className="text-[10px] text-slate-500 uppercase">{stat.label}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export const AchievementBadge: React.FC<{ title: string; icon: string; unlocked: boolean }> = ({ title, icon, unlocked }) => {
    return (
        <div className={`relative p-3 rounded-xl border transition-all ${unlocked
            ? 'bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-yellow-500/30'
            : 'bg-slate-800/30 border-slate-700/50 opacity-50'
            }`}>
            <div className="text-2xl mb-1">{icon}</div>
            <p className="text-xs text-slate-300 font-medium">{title}</p>
            {!unlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 rounded-xl">
                    <span className="text-slate-500 text-lg">🔒</span>
                </div>
            )}
        </div>
    );
};

export const DailyGoalProgress: React.FC = () => {
    const [user, setUser] = useState(userStore.getUser());
    const sessionMinutes = userStore.getSessionDuration();

    useEffect(() => {
        const unsubscribe = userStore.subscribe(() => setUser(userStore.getUser()));
        return () => { unsubscribe(); };
    }, []);

    if (!user) return null;

    const goal = user.preferences.dailyGoalMinutes;
    const progress = Math.min((sessionMinutes / goal) * 100, 100);
    const isComplete = progress >= 100;

    return (
        <div className={`rounded-xl p-4 border ${isComplete
            ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-500/30'
            : 'bg-slate-800/30 border-slate-700/50'
            }`}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Target className={`w-5 h-5 ${isComplete ? 'text-green-400' : 'text-slate-400'}`} />
                    <span className="text-sm font-medium text-slate-200">Daily Goal</span>
                </div>
                <span className={`text-sm font-bold ${isComplete ? 'text-green-400' : 'text-slate-400'}`}>
                    {sessionMinutes}/{goal} min
                </span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-indigo-500'
                        }`}
                    style={{ width: `${progress}%` }}
                />
            </div>
            {isComplete && (
                <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                    <Award size={12} /> Goal completed! +25 XP bonus
                </p>
            )}
        </div>
    );
};

import React, { useState, useEffect } from 'react';
import { Sun, Moon, Type, Eye, Volume2, VolumeX, Bell, BellOff, Target, Palette, X, Check, Settings, User, LogOut, ChevronRight } from 'lucide-react';
import { userStore } from '../store/userStore.ts';
import { UserPreferences } from '../types/features.types.ts';

interface SettingsPanelProps {
    onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
    const [user, setUser] = useState(userStore.getUser());
    const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'accessibility'>('preferences');
    const [editName, setEditName] = useState(user?.name || '');

    useEffect(() => {
        const unsubscribe = userStore.subscribe(() => setUser(userStore.getUser()));
        return () => { unsubscribe(); };
    }, []);

    if (!user) return null;

    const updatePref = (key: keyof UserPreferences, value: any) => {
        userStore.updatePreferences({ [key]: value });
    };

    const handleSaveProfile = () => {
        userStore.updateProfile({ name: editName });
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl flex">

                {/* Sidebar */}
                <div className="w-48 bg-slate-950 border-r border-slate-800 p-4">
                    <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Settings size={20} />
                        Settings
                    </h2>

                    <nav className="space-y-1">
                        {[
                            { id: 'profile', label: 'Profile', icon: User },
                            { id: 'preferences', label: 'Preferences', icon: Palette },
                            { id: 'accessibility', label: 'Accessibility', icon: Eye },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === tab.id
                                    ? 'bg-indigo-500/20 text-indigo-400'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    }`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col">
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                        <h3 className="font-bold text-white capitalize">{activeTab}</h3>
                        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">

                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-white">{user.name}</h4>
                                        <p className="text-sm text-slate-500">Level {user.level} • {user.xp.total.toLocaleString()} XP</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Display Name</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={e => setEditName(e.target.value)}
                                            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
                                        />
                                        <button
                                            onClick={handleSaveProfile}
                                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                                        >
                                            <Check size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-800">
                                    <h4 className="font-medium text-slate-300 mb-3">Statistics</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-slate-800/50 rounded-lg p-3">
                                            <p className="text-2xl font-bold text-white">{user.streak.longest}</p>
                                            <p className="text-xs text-slate-500">Best Streak</p>
                                        </div>
                                        <div className="bg-slate-800/50 rounded-lg p-3">
                                            <p className="text-2xl font-bold text-white">{user.xp.history.length}</p>
                                            <p className="text-xs text-slate-500">Days Active</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Preferences Tab */}
                        {activeTab === 'preferences' && (
                            <div className="space-y-6">
                                {/* Theme */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-3">Theme</label>
                                    <div className="flex gap-2">
                                        {(['light', 'dark', 'system'] as const).map(theme => (
                                            <button
                                                key={theme}
                                                onClick={() => updatePref('theme', theme)}
                                                className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 capitalize transition-all ${user.preferences.theme === theme
                                                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400'
                                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                                                    }`}
                                            >
                                                {theme === 'light' && <Sun size={16} />}
                                                {theme === 'dark' && <Moon size={16} />}
                                                {theme}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Voice */}
                                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        {user.preferences.voiceEnabled ? <Volume2 className="text-indigo-400" /> : <VolumeX className="text-slate-500" />}
                                        <div>
                                            <p className="font-medium text-white">Voice Features</p>
                                            <p className="text-xs text-slate-500">Enable text-to-speech for responses</p>
                                        </div>
                                    </div>
                                    <ToggleSwitch
                                        enabled={user.preferences.voiceEnabled}
                                        onChange={v => updatePref('voiceEnabled', v)}
                                    />
                                </div>

                                {/* Notifications */}
                                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        {user.preferences.notifications ? <Bell className="text-indigo-400" /> : <BellOff className="text-slate-500" />}
                                        <div>
                                            <p className="font-medium text-white">Notifications</p>
                                            <p className="text-xs text-slate-500">Study reminders and streak alerts</p>
                                        </div>
                                    </div>
                                    <ToggleSwitch
                                        enabled={user.preferences.notifications}
                                        onChange={v => updatePref('notifications', v)}
                                    />
                                </div>

                                {/* Daily Goal */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                                        <Target size={16} />
                                        Daily Study Goal
                                    </label>
                                    <div className="flex gap-2">
                                        {[15, 30, 45, 60, 90].map(mins => (
                                            <button
                                                key={mins}
                                                onClick={() => updatePref('dailyGoalMinutes', mins)}
                                                className={`flex-1 py-2 rounded-lg border text-sm transition-all ${user.preferences.dailyGoalMinutes === mins
                                                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400'
                                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                                                    }`}
                                            >
                                                {mins}m
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Learning Style */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-3">Learning Style</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(['auto', 'visual', 'verbal', 'kinesthetic'] as const).map(style => (
                                            <button
                                                key={style}
                                                onClick={() => updatePref('learningStyle', style)}
                                                className={`py-3 rounded-xl border capitalize transition-all ${user.preferences.learningStyle === style
                                                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400'
                                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                                                    }`}
                                            >
                                                {style === 'auto' ? '🤖 Auto-Detect' : style}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Accessibility Tab */}
                        {activeTab === 'accessibility' && (
                            <div className="space-y-6">
                                {/* Font Size */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                                        <Type size={16} />
                                        Font Size
                                    </label>
                                    <div className="flex gap-2">
                                        {(['small', 'medium', 'large'] as const).map(size => (
                                            <button
                                                key={size}
                                                onClick={() => updatePref('fontSize', size)}
                                                className={`flex-1 py-3 rounded-xl border capitalize transition-all ${user.preferences.fontSize === size
                                                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400'
                                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                                                    }`}
                                                style={{
                                                    fontSize: size === 'small' ? '12px' : size === 'large' ? '18px' : '14px'
                                                }}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* High Contrast */}
                                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <Eye className={user.preferences.highContrast ? 'text-indigo-400' : 'text-slate-500'} />
                                        <div>
                                            <p className="font-medium text-white">High Contrast Mode</p>
                                            <p className="text-xs text-slate-500">Increase color contrast for better visibility</p>
                                        </div>
                                    </div>
                                    <ToggleSwitch
                                        enabled={user.preferences.highContrast}
                                        onChange={v => updatePref('highContrast', v)}
                                    />
                                </div>

                                <div className="p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-xl">
                                    <h4 className="font-medium text-indigo-300 mb-2">Keyboard Shortcuts</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between text-slate-400">
                                            <span>Send message</span>
                                            <kbd className="px-2 py-0.5 bg-slate-800 rounded text-xs">Enter</kbd>
                                        </div>
                                        <div className="flex justify-between text-slate-400">
                                            <span>Voice input</span>
                                            <kbd className="px-2 py-0.5 bg-slate-800 rounded text-xs">Ctrl + M</kbd>
                                        </div>
                                        <div className="flex justify-between text-slate-400">
                                            <span>Open settings</span>
                                            <kbd className="px-2 py-0.5 bg-slate-800 rounded text-xs">Ctrl + ,</kbd>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

// Toggle Switch Component
const ToggleSwitch: React.FC<{ enabled: boolean; onChange: (value: boolean) => void }> = ({ enabled, onChange }) => {
    return (
        <button
            onClick={() => onChange(!enabled)}
            className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
        >
            <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${enabled ? 'translate-x-7' : 'translate-x-1'
                    }`}
            />
        </button>
    );
};

export default SettingsPanel;

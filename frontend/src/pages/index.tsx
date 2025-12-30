import React, { useState, useEffect, useRef } from 'react';
import { Send, Menu, ShieldCheck, LayoutDashboard, AlertCircle, Mic, MicOff, Image as ImageIcon, X, Settings, Layers, Brain, Download, Flame, Crown } from 'lucide-react';
import { ChatRoutes, AssignmentRoutes } from '../services/api.ts';
import { DepthLevel, TaskMode, Message } from '../types/index.ts';
import { userStore } from '../store/userStore.ts';
import '../index.css';

// Components
import { MessageBubble } from '../components/MessageBubble.tsx';
import { DepthSelector } from '../components/DepthSelector.tsx';
import { ModeSelector } from '../components/ModeSelector.tsx';
import { AssignmentFeedbackPanel } from '../components/AssignmentFeedback.tsx';
import { DashboardPage } from './Dashboard.tsx';
import { XPBar, StreakDisplay, DailyGoalProgress } from '../components/Gamification.tsx';
import { FlashcardViewer } from '../components/FlashcardViewer.tsx';
import { QuizPlayer, QuizGenerator } from '../components/QuizPlayer.tsx';
import { SettingsPanel } from '../components/SettingsPanel.tsx';
import { ExportPanel } from '../components/ExportPanel.tsx';
import { Quiz } from '../types/features.types.ts';

const StudentHomePage: React.FC = () => {
  // State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm **StudyWithMe**, your dedicated study companion! 📚\n\nI can help you with:\n- **Programming** (Python, JavaScript, C++, and more)\n- **Mathematics** (Algebra, Calculus, Statistics)\n- **Science** (Physics, Chemistry, Biology)\n- **And much more!**\n\nI provide **complete, detailed answers** - never truncated. What would you like to learn today?",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<{ file: File; preview: string } | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Settings
  const [depth, setDepth] = useState<DepthLevel>(DepthLevel.Core);
  const [mode, setMode] = useState<TaskMode>(TaskMode.Learning);
  const [showAssignmentPanel, setShowAssignmentPanel] = useState(false);

  // View State
  const [view, setView] = useState<'student' | 'dashboard'>('student');

  // Feature Panels
  const [showSettings, setShowSettings] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [showQuizGenerator, setShowQuizGenerator] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // User Data
  const [user, setUser] = useState(userStore.getUser());

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const unsubscribe = userStore.subscribe(() => setUser(userStore.getUser()));
    return () => { unsubscribe(); };
  }, []);

  useEffect(() => {
    ChatRoutes.initialize("");
    AssignmentRoutes.initialize("");
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === ',') {
        e.preventDefault();
        setShowSettings(true);
      }
      if (e.ctrlKey && e.key === 'm') {
        e.preventDefault();
        toggleListening();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage({
          file,
          preview: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event);
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => {
          const trimmed = prev.trim();
          return trimmed ? `${trimmed} ${transcript}` : transcript;
        });
      };

      recognition.start();
    } else {
      alert("Speech recognition is not supported in this browser.");
    }
  };

  const handleSendMessage = async () => {
    if ((!input.trim() && !selectedImage) || loading) return;

    let imageData = undefined;
    let base64Data = "";

    if (selectedImage) {
      base64Data = selectedImage.preview.split(',')[1];
      imageData = {
        data: base64Data,
        mimeType: selectedImage.file.type
      };
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
      image: selectedImage ? { data: base64Data, mimeType: selectedImage.file.type } : undefined,
      metadata: { depth, mode }
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSelectedImage(null);
    setLoading(true);
    setError(null);

    // Track message for XP
    userStore.incrementMessages();

    try {
      const response = await ChatRoutes.sendMessage(userMsg.content, depth, mode, imageData);

      if (response.error) {
        throw new Error(response.error);
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        timestamp: Date.now(),
        metadata: {
          depth,
          mode,
          isAssignment: mode === TaskMode.Assignment
        }
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: 'system',
        content: "System Error: Unable to process request. Please check your network or API key.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 p-6 rounded-xl shadow-lg border border-red-900 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-100 mb-2">Configuration Error</h2>
          <p className="text-slate-400 mb-4">{error}</p>
          <p className="text-xs text-slate-500">Please verify your metadata.json or environment variables.</p>
        </div>
      </div>
    );
  }

  // Dashboard View
  if (view === 'dashboard') {
    return <DashboardPage onBack={() => setView('student')} />;
  }

  // Student View
  return (
    <div className={`flex h-screen overflow-hidden bg-slate-950 font-sans text-slate-100 ${user?.preferences.highContrast ? 'high-contrast' : ''} font-size-${user?.preferences.fontSize || 'medium'}`}>

      {/* Sidebar */}
      <aside className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col z-10 shadow-lg hidden md:flex">
        {/* Header */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-extrabold bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              StudyWithMe
            </h1>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <Settings size={18} />
            </button>
          </div>

          {/* User Level & Streak */}
          {user && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white text-sm">{user.name}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Crown size={12} className="text-yellow-500" />
                    Level {user.level}
                    <span className="text-slate-700">•</span>
                    <Flame size={12} className="text-orange-400" />
                    {user.streak.current} day streak
                  </div>
                </div>
              </div>
              <XPBar />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-6 flex-1 space-y-6 overflow-y-auto scrollbar-hide">
          <section>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Task Mode</h3>
            <ModeSelector
              currentMode={mode}
              onChange={setMode}
              disabled={loading}
            />
          </section>

          <section>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Learning Depth</h3>
            <DepthSelector
              currentDepth={depth}
              onChange={setDepth}
              disabled={loading}
            />
          </section>

          <DailyGoalProgress />

          {/* Quick Actions */}
          <section className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Study Tools</h3>

            <button
              onClick={() => setShowFlashcards(true)}
              className="w-full py-3 px-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl text-slate-300 text-sm font-medium transition-all flex items-center gap-3"
            >
              <Layers size={18} className="text-indigo-400" />
              Flashcards
              <span className="ml-auto bg-indigo-500/20 text-indigo-400 text-xs px-2 py-0.5 rounded-full">New</span>
            </button>

            <button
              onClick={() => setShowQuizGenerator(true)}
              className="w-full py-3 px-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl text-slate-300 text-sm font-medium transition-all flex items-center gap-3"
            >
              <Brain size={18} className="text-purple-400" />
              Quiz Mode
            </button>

            {mode === TaskMode.Learning && (
              <button
                onClick={() => setShowAssignmentPanel(true)}
                className="w-full py-3 px-4 border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-xl text-slate-400 hover:text-emerald-400 text-sm font-medium transition-all flex items-center gap-3"
              >
                <ShieldCheck size={18} />
                Generate Practice
              </button>
            )}

            <button
              onClick={() => setShowExport(true)}
              className="w-full py-3 px-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl text-slate-300 text-sm font-medium transition-all flex items-center gap-3"
            >
              <Download size={18} className="text-slate-400" />
              Export Chat
            </button>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={() => setView('dashboard')}
            className="w-full flex items-center justify-center gap-2 p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <LayoutDashboard size={18} />
            Open Dashboard
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative bg-slate-950">
        {/* Mobile Header */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 md:hidden">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-white">StudyWithMe</span>
            {user && (
              <span className="flex items-center gap-1 text-xs text-orange-400">
                <Flame size={12} /> {user.streak.current}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowSettings(true)} className="p-2">
              <Settings size={20} className="text-slate-400" />
            </button>
            <button onClick={() => setView('dashboard')} className="p-2">
              <LayoutDashboard size={20} className="text-slate-400" />
            </button>
            <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="p-2">
              <Menu size={20} className="text-slate-400" />
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
          <div className="max-w-3xl mx-auto">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {loading && (
              <div className="flex justify-start mb-6">
                <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-4 py-3 rounded-2xl rounded-tl-none">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-900 border-t border-slate-800">
          <div className="max-w-3xl mx-auto space-y-2">
            {/* Image Preview */}
            {selectedImage && (
              <div className="flex items-start gap-2 mb-2">
                <div className="relative group">
                  <img src={selectedImage.preview} alt="Upload preview" className="h-16 w-16 object-cover rounded-lg border border-slate-600" />
                  <button
                    onClick={clearImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            )}

            <div className="relative flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 bg-slate-800 text-slate-400 rounded-xl hover:bg-slate-700 hover:text-slate-200 transition-colors"
                title="Upload Image"
              >
                <ImageIcon size={20} />
              </button>

              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={isListening ? "Listening..." : (mode === TaskMode.Assignment ? "Ask for a hint..." : "Ask anything about programming, math, science...")}
                  disabled={loading}
                  className={`w-full bg-slate-800 text-slate-100 pl-4 pr-12 py-4 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-slate-800 transition-all outline-none border ${isListening ? 'border-red-500/50 ring-2 ring-red-500/20 placeholder:text-red-400' : 'border-slate-700 placeholder:text-slate-500'}`}
                  autoFocus
                />
                <button
                  onClick={toggleListening}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all duration-200 ${isListening
                    ? 'text-red-500 bg-red-500/10 animate-pulse'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                    }`}
                  title={isListening ? "Stop Listening" : "Start Listening (Ctrl+M)"}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
              </div>

              <button
                onClick={handleSendMessage}
                disabled={(!input.trim() && !selectedImage) || loading}
                className="p-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20"
              >
                <Send size={20} />
              </button>
            </div>

            <div className="text-center">
              <p className="text-[10px] text-slate-600">
                {mode === TaskMode.Assignment
                  ? "Assignment Mode: I'll guide you without giving direct answers."
                  : "I provide complete, detailed answers for all study-related questions."}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Modals & Panels */}
      {showAssignmentPanel && (
        <div className="absolute inset-y-0 right-0 z-20 shadow-2xl animate-in slide-in-from-right duration-300">
          <AssignmentFeedbackPanel depth={depth} onClose={() => setShowAssignmentPanel(false)} />
        </div>
      )}

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}

      {showFlashcards && <FlashcardViewer onClose={() => setShowFlashcards(false)} />}

      {showQuizGenerator && (
        <QuizGenerator
          topic={messages.length > 1 ? "Recent Topics" : "General Knowledge"}
          onGenerate={(quiz) => {
            setShowQuizGenerator(false);
            setActiveQuiz(quiz);
          }}
          onClose={() => setShowQuizGenerator(false)}
        />
      )}

      {activeQuiz && (
        <QuizPlayer
          quiz={activeQuiz}
          onComplete={() => { }}
          onClose={() => setActiveQuiz(null)}
        />
      )}

      {showExport && <ExportPanel messages={messages} onClose={() => setShowExport(false)} />}

    </div>
  );
};

export default StudentHomePage;
// Quiz System - Production Quality
// QuizPlayer: Plays quizzes with timer, scoring, and results
// QuizGenerator: AI-powered quiz generation with real questions

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Clock, CheckCircle, ArrowRight, Trophy, Timer, Brain, AlertCircle, RefreshCw } from 'lucide-react';
import { quizStore } from '../store/quizStore.ts';
import { Quiz, QuizQuestion, QuizAttempt } from '../types/features.types.ts';
import config from '../config/index.ts';

const API_URL = config.API_URL;

// ============ QUIZ PLAYER COMPONENT ============
interface QuizPlayerProps {
    quiz: Quiz;
    onClose: () => void;
    onComplete: (attempt: QuizAttempt) => void;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({ quiz, onClose, onComplete }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [timeRemaining, setTimeRemaining] = useState(quiz.timeLimit || 0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const startTimeRef = useRef(Date.now());
    const hasRegisteredRef = useRef(false);

    // Register quiz on mount
    useEffect(() => {
        if (!hasRegisteredRef.current) {
            quizStore.registerQuiz(quiz);
            hasRegisteredRef.current = true;
            console.log('QuizPlayer: Registered quiz', quiz.id);
        }
    }, [quiz]);

    const currentQuestion = quiz.questions[currentIndex];
    const isLastQuestion = currentIndex === quiz.questions.length - 1;
    const hasTimeLimit = quiz.timeLimit && quiz.timeLimit > 0;
    const answeredCount = Object.keys(answers).length;

    // Timer effect
    useEffect(() => {
        if (!hasTimeLimit || isSubmitted) return;

        const interval = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [hasTimeLimit, isSubmitted]);

    const handleAnswer = useCallback((answer: string) => {
        setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));
    }, [currentQuestion?.id]);

    const handleNext = useCallback(() => {
        if (currentIndex < quiz.questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    }, [currentIndex, quiz.questions.length]);

    const handlePrevious = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    }, [currentIndex]);

    const handleSubmit = useCallback(() => {
        if (isSubmitted) return;

        try {
            const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
            console.log('QuizPlayer: Submitting attempt for quiz', quiz.id);
            console.log('QuizPlayer: Answers:', answers);

            const result = quizStore.submitAttempt(quiz.id, answers, timeTaken);

            console.log('QuizPlayer: Attempt result:', result);
            setAttempt(result);
            setIsSubmitted(true);
            setSubmitError(null);
            onComplete(result);
        } catch (error: any) {
            console.error('QuizPlayer: Submit error:', error);
            setSubmitError(error.message || 'Failed to submit quiz');
        }
    }, [quiz.id, answers, isSubmitted, onComplete]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getScoreColor = (percentage: number): string => {
        if (percentage >= 80) return 'text-green-400';
        if (percentage >= 60) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getScoreBgColor = (percentage: number): string => {
        if (percentage >= 80) return 'bg-green-500/20';
        if (percentage >= 60) return 'bg-yellow-500/20';
        return 'bg-red-500/20';
    };

    // ============ RESULTS VIEW ============
    if (isSubmitted && attempt) {
        const percentage = Math.round((attempt.score / attempt.totalQuestions) * 100);

        return (
            <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                    <div className="p-8 text-center flex-shrink-0">
                        <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${getScoreBgColor(percentage)}`}>
                            {percentage >= 80 ? (
                                <Trophy className="w-12 h-12 text-green-400" />
                            ) : percentage >= 60 ? (
                                <CheckCircle className="w-12 h-12 text-yellow-400" />
                            ) : (
                                <AlertCircle className="w-12 h-12 text-red-400" />
                            )}
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-2">Quiz Complete!</h2>
                        <p className={`text-5xl font-bold mb-2 ${getScoreColor(percentage)}`}>
                            {percentage}%
                        </p>
                        <p className="text-slate-400 mb-6">
                            You got <span className="font-bold text-white">{attempt.score}</span> out of <span className="font-bold text-white">{attempt.totalQuestions}</span> questions correct
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-slate-800/50 rounded-lg p-4">
                                <Clock className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                                <p className="text-lg font-bold text-white">{formatTime(attempt.timeTaken)}</p>
                                <p className="text-xs text-slate-500">Time Taken</p>
                            </div>
                            <div className="bg-slate-800/50 rounded-lg p-4">
                                <Brain className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
                                <p className="text-lg font-bold text-indigo-400">
                                    +{percentage >= 90 ? 50 : percentage >= 80 ? 40 : percentage >= 70 ? 30 : percentage >= 50 ? 20 : 10} XP
                                </p>
                                <p className="text-xs text-slate-500">Earned</p>
                            </div>
                        </div>
                    </div>

                    {/* Review Answers - Scrollable */}
                    <div className="flex-1 overflow-y-auto px-8 pb-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Review Answers</h3>
                        <div className="space-y-2">
                            {quiz.questions.map((q, i) => {
                                const userAnswer = answers[q.id] || '';
                                const isCorrect = userAnswer.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
                                return (
                                    <div key={q.id} className={`p-4 rounded-lg border ${isCorrect ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                                        <p className="text-sm text-slate-300 mb-2 font-medium">
                                            Q{i + 1}: {q.question}
                                        </p>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex items-start gap-2">
                                                <span className="text-slate-500 shrink-0">Your answer:</span>
                                                <span className={isCorrect ? 'text-green-400' : 'text-red-400'}>
                                                    {userAnswer || '(not answered)'}
                                                </span>
                                            </div>
                                            {!isCorrect && (
                                                <div className="flex items-start gap-2">
                                                    <span className="text-slate-500 shrink-0">Correct:</span>
                                                    <span className="text-green-400">{q.correctAnswer}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-6 border-t border-slate-800 flex-shrink-0">
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ============ QUIZ VIEW ============
    if (!currentQuestion) {
        return (
            <div className="fixed inset-0 z-50 bg-slate-950/95 flex items-center justify-center p-4">
                <div className="bg-slate-900 rounded-2xl p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <p className="text-white">No questions available</p>
                    <button onClick={onClose} className="mt-4 px-6 py-2 bg-slate-700 rounded-lg text-white">
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-xl overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="p-4 border-b border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h3 className="font-bold text-white">{quiz.title}</h3>
                            <p className="text-xs text-slate-500">
                                Question {currentIndex + 1} of {quiz.questions.length} • {answeredCount} answered
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {hasTimeLimit && (
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm ${timeRemaining < 60 ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-slate-800 text-slate-300'
                                    }`}>
                                    <Timer size={16} />
                                    {formatTime(timeRemaining)}
                                </div>
                            )}
                            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                            style={{ width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Question */}
                <div className="p-8">
                    <p className="text-lg text-white mb-6 leading-relaxed">{currentQuestion.question}</p>

                    {/* Submit Error */}
                    {submitError && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                            {submitError}
                        </div>
                    )}

                    {/* MCQ Options */}
                    {currentQuestion.type === 'mcq' && currentQuestion.options && (
                        <div className="space-y-3">
                            {currentQuestion.options.map((option, i) => {
                                const isSelected = answers[currentQuestion.id] === option;
                                return (
                                    <button
                                        key={i}
                                        onClick={() => handleAnswer(option)}
                                        className={`w-full text-left p-4 rounded-xl border transition-all ${isSelected
                                            ? 'bg-indigo-500/20 border-indigo-500 text-white ring-2 ring-indigo-500/50'
                                            : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-800'
                                            }`}
                                    >
                                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium mr-3 ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'
                                            }`}>
                                            {String.fromCharCode(65 + i)}
                                        </span>
                                        {option}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* True/False */}
                    {currentQuestion.type === 'true-false' && (
                        <div className="flex gap-4">
                            {['True', 'False'].map(option => (
                                <button
                                    key={option}
                                    onClick={() => handleAnswer(option)}
                                    className={`flex-1 py-4 rounded-xl border-2 font-medium transition-all ${answers[currentQuestion.id] === option
                                        ? 'bg-indigo-500/20 border-indigo-500 text-white'
                                        : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-500'
                                        }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Short Answer */}
                    {(currentQuestion.type === 'short-answer' || currentQuestion.type === 'fill-blank') && (
                        <input
                            type="text"
                            value={answers[currentQuestion.id] || ''}
                            onChange={e => handleAnswer(e.target.value)}
                            placeholder="Type your answer..."
                            className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl p-4 text-white placeholder:text-slate-500 focus:border-indigo-500 outline-none transition-colors"
                        />
                    )}
                </div>

                {/* Navigation */}
                <div className="p-4 border-t border-slate-800 flex items-center justify-between">
                    <button
                        onClick={handlePrevious}
                        disabled={currentIndex === 0}
                        className="px-4 py-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        ← Previous
                    </button>

                    {/* Question Dots */}
                    <div className="flex gap-1.5 flex-wrap justify-center max-w-xs">
                        {quiz.questions.map((q, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentIndex(i)}
                                title={`Question ${i + 1}`}
                                className={`w-2.5 h-2.5 rounded-full transition-all ${i === currentIndex
                                    ? 'bg-indigo-500 w-5'
                                    : answers[q.id]
                                        ? 'bg-green-500'
                                        : 'bg-slate-700 hover:bg-slate-600'
                                    }`}
                            />
                        ))}
                    </div>

                    {isLastQuestion ? (
                        <button
                            onClick={handleSubmit}
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg shadow-green-500/20"
                        >
                            Submit Quiz
                            <CheckCircle size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            className="px-4 py-2 text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                        >
                            Next →
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// ============ QUIZ GENERATOR COMPONENT ============
interface QuizGeneratorProps {
    topic: string;
    onGenerate: (quiz: Quiz) => void;
    onClose: () => void;
}

export const QuizGenerator: React.FC<QuizGeneratorProps> = ({ topic: initialTopic, onGenerate, onClose }) => {
    const [topic, setTopic] = useState(initialTopic === 'Recent Topics' || initialTopic === 'General Knowledge' ? '' : initialTopic);
    const [questionCount, setQuestionCount] = useState(5);
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
    const [timeLimit, setTimeLimit] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState<string>('');

    const parseAIQuestions = (rawText: string, topicName: string): QuizQuestion[] => {
        const questions: QuizQuestion[] = [];
        console.log('Parsing AI response:', rawText.substring(0, 500) + '...');

        // Split by question numbers
        const questionBlocks = rawText.split(/(?=\d+[\.\)]\s)/);

        for (const block of questionBlocks) {
            if (!block.trim() || block.trim().length < 10) continue;

            // Extract question text - match until we hit options
            const questionMatch = block.match(/^\d+[\.\)]\s*(.+?)(?=\n\s*[A-Da-d][\)\.]|\n\s*[A-Da-d]\s)/s);
            if (!questionMatch) continue;

            const questionText = questionMatch[1]
                .trim()
                .replace(/\*\*/g, '')
                .replace(/\n/g, ' ')
                .replace(/\s+/g, ' ');

            if (questionText.length < 5) continue;

            // Extract options
            const options: string[] = [];
            const optionRegex = /([A-Da-d])[\)\.\:]\s*(.+?)(?=\n\s*[A-Da-d][\)\.\:]|\n\s*(?:Answer|Correct)|$)/gs;
            let optionMatch;

            while ((optionMatch = optionRegex.exec(block)) !== null) {
                const optionText = optionMatch[2]
                    .trim()
                    .replace(/\*\*/g, '')
                    .replace(/\n/g, ' ')
                    .replace(/\s+/g, ' ');
                if (optionText && optionText.length > 0) {
                    options.push(optionText);
                }
            }

            // Extract correct answer
            const answerMatch = block.match(/(?:Answer|Correct(?:\s+Answer)?)[:\s]*([A-Da-d])/i);
            let correctAnswer = '';

            if (answerMatch && options.length > 0) {
                const answerLetter = answerMatch[1].toUpperCase();
                const answerIndex = answerLetter.charCodeAt(0) - 65;
                if (answerIndex >= 0 && answerIndex < options.length) {
                    correctAnswer = options[answerIndex];
                }
            }

            // Validate and add question
            if (questionText && options.length >= 2) {
                questions.push({
                    id: `q_${Date.now()}_${questions.length}_${Math.random().toString(36).substr(2, 5)}`,
                    type: 'mcq',
                    question: questionText,
                    options: options.slice(0, 4),
                    correctAnswer: correctAnswer || options[0],
                    difficulty,
                    topic: topicName
                });
            }
        }

        console.log(`Parsed ${questions.length} questions`);
        return questions;
    };

    const handleGenerate = async () => {
        if (!topic.trim()) {
            setError('Please enter a topic');
            return;
        }

        setIsGenerating(true);
        setError(null);
        setProgress('Connecting to AI...');

        try {
            setProgress('Generating questions with AI...');

            const response = await fetch(`${API_URL}/quiz/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: topic.trim(),
                    questionCount,
                    difficulty
                })
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const result = await response.json();
            console.log('Quiz API Response:', result);

            if (!result.success) {
                throw new Error(result.error || 'Failed to generate quiz');
            }

            if (!result.data?.rawQuestions) {
                throw new Error('No questions received from AI');
            }

            setProgress('Parsing questions...');

            // Parse the AI-generated questions
            const parsedQuestions = parseAIQuestions(result.data.rawQuestions, topic);

            if (parsedQuestions.length === 0) {
                console.error('Raw questions that failed to parse:', result.data.rawQuestions);
                throw new Error('Could not parse quiz questions. The AI response format was unexpected. Please try again.');
            }

            // Create the quiz object
            const quiz: Quiz = {
                id: 'quiz_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                title: `Quiz: ${topic}`,
                topic: topic.trim(),
                questions: parsedQuestions,
                timeLimit: timeLimit > 0 ? timeLimit * 60 : undefined,
                createdAt: Date.now()
            };

            // Register quiz in store BEFORE passing to player
            quizStore.registerQuiz(quiz);
            console.log('Quiz registered:', quiz.id, 'with', quiz.questions.length, 'questions');

            setIsGenerating(false);
            setProgress('');
            onGenerate(quiz);

        } catch (err: any) {
            console.error('Quiz generation error:', err);
            setError(err.message || 'Failed to generate quiz. Please check your connection and try again.');
            setIsGenerating(false);
            setProgress('');
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-md overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white">Generate Quiz with AI</h2>
                        <p className="text-xs text-slate-500 mt-1">Questions are generated dynamically by AI</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Topic Input */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Topic <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={topic}
                            onChange={e => setTopic(e.target.value)}
                            placeholder="e.g., Python basics, Solar System, World War II..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                            autoFocus
                            disabled={isGenerating}
                        />
                    </div>

                    {/* Question Count */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Number of Questions</label>
                        <div className="grid grid-cols-4 gap-2">
                            {[5, 10, 15, 20].map(n => (
                                <button
                                    key={n}
                                    onClick={() => setQuestionCount(n)}
                                    disabled={isGenerating}
                                    className={`py-2.5 rounded-lg border font-medium transition-all ${questionCount === n
                                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400'
                                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 disabled:opacity-50'
                                        }`}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Difficulty */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Difficulty</label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['easy', 'medium', 'hard'] as const).map(d => (
                                <button
                                    key={d}
                                    onClick={() => setDifficulty(d)}
                                    disabled={isGenerating}
                                    className={`py-2.5 rounded-lg border capitalize font-medium transition-all ${difficulty === d
                                        ? d === 'easy' ? 'bg-green-500/20 border-green-500 text-green-400'
                                            : d === 'medium' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                                                : 'bg-red-500/20 border-red-500 text-red-400'
                                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 disabled:opacity-50'
                                        }`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Time Limit */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Time Limit <span className="text-slate-500">(0 = unlimited)</span>
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="range"
                                value={timeLimit}
                                onChange={e => setTimeLimit(parseInt(e.target.value))}
                                min={0}
                                max={30}
                                step={5}
                                disabled={isGenerating}
                                className="flex-1 accent-indigo-500"
                            />
                            <span className="w-20 text-center text-white font-medium">
                                {timeLimit === 0 ? 'None' : `${timeLimit} min`}
                            </span>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-start gap-3">
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Progress */}
                    {progress && (
                        <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-400 text-sm flex items-center gap-3">
                            <RefreshCw size={18} className="animate-spin" />
                            <span>{progress}</span>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-800">
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !topic.trim()}
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                    >
                        {isGenerating ? (
                            <>
                                <RefreshCw size={18} className="animate-spin" />
                                Generating with AI...
                            </>
                        ) : (
                            <>
                                <Brain size={18} />
                                Generate Quiz
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

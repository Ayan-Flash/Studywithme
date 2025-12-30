import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, RotateCcw, Check, ThumbsUp, ThumbsDown, Plus, BookOpen, Layers } from 'lucide-react';
import { flashcardStore } from '../store/flashcardStore.ts';
import { Flashcard, FlashcardDeck } from '../types/features.types.ts';

interface FlashcardViewerProps {
    onClose: () => void;
}

export const FlashcardViewer: React.FC<FlashcardViewerProps> = ({ onClose }) => {
    const [decks, setDecks] = useState<FlashcardDeck[]>(flashcardStore.getDecks());
    const [selectedDeck, setSelectedDeck] = useState<FlashcardDeck | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [showCreateDeck, setShowCreateDeck] = useState(false);
    const [showAddCard, setShowAddCard] = useState(false);
    const [newDeckName, setNewDeckName] = useState('');
    const [newCardFront, setNewCardFront] = useState('');
    const [newCardBack, setNewCardBack] = useState('');

    useEffect(() => {
        const unsubscribe = flashcardStore.subscribe(() => {
            setDecks(flashcardStore.getDecks());
        });
        return () => { unsubscribe(); };
    }, []);

    const dueCards = selectedDeck
        ? flashcardStore.getCardsForReview(selectedDeck.id)
        : flashcardStore.getCardsForReview();

    const currentCard = dueCards[currentIndex];

    const handleRate = (quality: number) => {
        if (!currentCard || !selectedDeck) return;
        flashcardStore.reviewCard(selectedDeck.id, currentCard.id, quality);
        setIsFlipped(false);
        if (currentIndex < dueCards.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setCurrentIndex(0);
        }
    };

    const handleCreateDeck = () => {
        if (!newDeckName.trim()) return;
        flashcardStore.createDeck(newDeckName);
        setNewDeckName('');
        setShowCreateDeck(false);
    };

    const handleAddCard = () => {
        if (!selectedDeck || !newCardFront.trim() || !newCardBack.trim()) return;
        flashcardStore.addCard(selectedDeck.id, newCardFront, newCardBack);
        setNewCardFront('');
        setNewCardBack('');
        setShowAddCard(false);
    };

    // Deck Selection View
    if (!selectedDeck) {
        return (
            <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-indigo-500/20 p-2 rounded-lg">
                                <Layers className="w-6 h-6 text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Flashcards</h2>
                                <p className="text-sm text-slate-400">{flashcardStore.getDueCount()} cards due for review</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto max-h-96">
                        {decks.length === 0 ? (
                            <div className="text-center py-12">
                                <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                <p className="text-slate-400 mb-4">No flashcard decks yet</p>
                                <button
                                    onClick={() => setShowCreateDeck(true)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                                >
                                    Create Your First Deck
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                {decks.map(deck => {
                                    const dueCount = flashcardStore.getCardsForReview(deck.id).length;
                                    return (
                                        <button
                                            key={deck.id}
                                            onClick={() => setSelectedDeck(deck)}
                                            className="text-left p-4 rounded-xl border border-slate-700 hover:border-indigo-500/50 bg-slate-800/50 hover:bg-slate-800 transition-all group"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: deck.color }}
                                                />
                                                {dueCount > 0 && (
                                                    <span className="bg-indigo-500/20 text-indigo-400 text-xs font-bold px-2 py-0.5 rounded-full">
                                                        {dueCount} due
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors">
                                                {deck.name}
                                            </h3>
                                            <p className="text-sm text-slate-500 mt-1">
                                                {deck.cards.length} cards
                                            </p>
                                        </button>
                                    );
                                })}
                                <button
                                    onClick={() => setShowCreateDeck(true)}
                                    className="p-4 rounded-xl border-2 border-dashed border-slate-700 hover:border-indigo-500/50 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-400 transition-all min-h-[120px]"
                                >
                                    <Plus className="w-8 h-8 mb-2" />
                                    <span className="text-sm font-medium">New Deck</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Create Deck Modal */}
                    {showCreateDeck && (
                        <div className="absolute inset-0 bg-slate-900/90 flex items-center justify-center p-4">
                            <div className="bg-slate-800 rounded-xl p-6 w-full max-w-sm border border-slate-700">
                                <h3 className="text-lg font-bold text-white mb-4">Create New Deck</h3>
                                <input
                                    type="text"
                                    value={newDeckName}
                                    onChange={e => setNewDeckName(e.target.value)}
                                    placeholder="Deck name..."
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white placeholder:text-slate-500 mb-4"
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowCreateDeck(false)}
                                        className="flex-1 py-2 border border-slate-600 rounded-lg text-slate-400 hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleCreateDeck}
                                        className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-medium transition-colors"
                                    >
                                        Create
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Flashcard Review View
    return (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-xl overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                    <button
                        onClick={() => setSelectedDeck(null)}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <ChevronLeft size={18} />
                        Back to Decks
                    </button>
                    <span className="text-sm text-slate-500">
                        {currentIndex + 1} / {dueCards.length}
                    </span>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="p-8">
                    {dueCards.length === 0 ? (
                        <div className="text-center py-12">
                            <Check className="w-16 h-16 text-green-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">All caught up!</h3>
                            <p className="text-slate-400 mb-6">No cards due for review in this deck.</p>
                            <button
                                onClick={() => setShowAddCard(true)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                            >
                                Add New Card
                            </button>
                        </div>
                    ) : currentCard ? (
                        <>
                            {/* Card */}
                            <div
                                onClick={() => setIsFlipped(!isFlipped)}
                                className="relative h-64 cursor-pointer perspective-1000 mb-6"
                            >
                                <div className={`absolute inset-0 transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                                    {/* Front */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 flex items-center justify-center border border-slate-700 backface-hidden">
                                        <p className="text-xl text-center text-white font-medium">{currentCard.front}</p>
                                    </div>
                                    {/* Back */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-xl p-6 flex items-center justify-center border border-indigo-500/30 backface-hidden rotate-y-180">
                                        <p className="text-lg text-center text-slate-200">{currentCard.back}</p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-center text-sm text-slate-500 mb-4">
                                {isFlipped ? 'How well did you know this?' : 'Click card to reveal answer'}
                            </p>

                            {/* Rating Buttons */}
                            {isFlipped && (
                                <div className="flex gap-3 justify-center">
                                    <button
                                        onClick={() => handleRate(1)}
                                        className="flex-1 max-w-[100px] py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-red-400 font-medium transition-colors flex flex-col items-center gap-1"
                                    >
                                        <ThumbsDown size={18} />
                                        <span className="text-xs">Again</span>
                                    </button>
                                    <button
                                        onClick={() => handleRate(3)}
                                        className="flex-1 max-w-[100px] py-3 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 rounded-xl text-yellow-400 font-medium transition-colors flex flex-col items-center gap-1"
                                    >
                                        <RotateCcw size={18} />
                                        <span className="text-xs">Hard</span>
                                    </button>
                                    <button
                                        onClick={() => handleRate(4)}
                                        className="flex-1 max-w-[100px] py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl text-green-400 font-medium transition-colors flex flex-col items-center gap-1"
                                    >
                                        <Check size={18} />
                                        <span className="text-xs">Good</span>
                                    </button>
                                    <button
                                        onClick={() => handleRate(5)}
                                        className="flex-1 max-w-[100px] py-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-xl text-emerald-400 font-medium transition-colors flex flex-col items-center gap-1"
                                    >
                                        <ThumbsUp size={18} />
                                        <span className="text-xs">Easy</span>
                                    </button>
                                </div>
                            )}
                        </>
                    ) : null}
                </div>

                {/* Add Card Modal */}
                {showAddCard && (
                    <div className="absolute inset-0 bg-slate-900/90 flex items-center justify-center p-4">
                        <div className="bg-slate-800 rounded-xl p-6 w-full max-w-sm border border-slate-700">
                            <h3 className="text-lg font-bold text-white mb-4">Add New Card</h3>
                            <input
                                type="text"
                                value={newCardFront}
                                onChange={e => setNewCardFront(e.target.value)}
                                placeholder="Front (question)..."
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white placeholder:text-slate-500 mb-3"
                                autoFocus
                            />
                            <textarea
                                value={newCardBack}
                                onChange={e => setNewCardBack(e.target.value)}
                                placeholder="Back (answer)..."
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white placeholder:text-slate-500 mb-4 h-24 resize-none"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowAddCard(false)}
                                    className="flex-1 py-2 border border-slate-600 rounded-lg text-slate-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddCard}
                                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-medium transition-colors"
                                >
                                    Add Card
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

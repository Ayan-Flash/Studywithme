import { Flashcard, FlashcardDeck } from '../types/features.types.ts';
import { userStore } from './userStore.ts';

const STORAGE_KEY = 'studywithme_flashcards';

class FlashcardStore {
    private decks: FlashcardDeck[] = [];
    private listeners: Set<() => void> = new Set();

    constructor() {
        this.loadFromStorage();
    }

    private loadFromStorage() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                this.decks = JSON.parse(stored);
            }
        } catch (e) {
            this.decks = [];
        }
    }

    private saveToStorage() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.decks));
    }

    private notify() {
        this.listeners.forEach(fn => fn());
    }

    subscribe(fn: () => void) {
        this.listeners.add(fn);
        return () => this.listeners.delete(fn);
    }

    getDecks(): FlashcardDeck[] {
        return this.decks;
    }

    getDeck(id: string): FlashcardDeck | undefined {
        return this.decks.find(d => d.id === id);
    }

    createDeck(name: string, description?: string, color?: string): FlashcardDeck {
        const deck: FlashcardDeck = {
            id: 'deck_' + Date.now(),
            name,
            description,
            color: color || this.getRandomColor(),
            cards: [],
            createdAt: Date.now()
        };
        this.decks.push(deck);
        this.saveToStorage();
        this.notify();
        userStore.addXP(10, 'deck_created');
        return deck;
    }

    deleteDeck(id: string) {
        this.decks = this.decks.filter(d => d.id !== id);
        this.saveToStorage();
        this.notify();
    }

    // ============ SM-2 SPACED REPETITION ALGORITHM ============
    addCard(deckId: string, front: string, back: string, topic?: string): Flashcard | null {
        const deck = this.getDeck(deckId);
        if (!deck) return null;

        const card: Flashcard = {
            id: 'card_' + Date.now(),
            front,
            back,
            topic: topic || deck.name,
            createdAt: Date.now(),
            nextReviewAt: Date.now(),
            interval: 1,
            easeFactor: 2.5,
            repetitions: 0
        };

        deck.cards.push(card);
        this.saveToStorage();
        this.notify();
        userStore.addXP(5, 'card_created');
        return card;
    }

    deleteCard(deckId: string, cardId: string) {
        const deck = this.getDeck(deckId);
        if (!deck) return;
        deck.cards = deck.cards.filter(c => c.id !== cardId);
        this.saveToStorage();
        this.notify();
    }

    // SM-2 Algorithm implementation
    reviewCard(deckId: string, cardId: string, quality: number) {
        // Quality: 0-5 (0=complete fail, 5=perfect)
        const deck = this.getDeck(deckId);
        if (!deck) return;

        const card = deck.cards.find(c => c.id === cardId);
        if (!card) return;

        card.lastReviewedAt = Date.now();

        if (quality < 3) {
            // Failed - reset repetitions
            card.repetitions = 0;
            card.interval = 1;
        } else {
            // Passed
            if (card.repetitions === 0) {
                card.interval = 1;
            } else if (card.repetitions === 1) {
                card.interval = 6;
            } else {
                card.interval = Math.round(card.interval * card.easeFactor);
            }
            card.repetitions++;
        }

        // Update ease factor
        card.easeFactor = Math.max(1.3,
            card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
        );

        // Set next review date
        card.nextReviewAt = Date.now() + (card.interval * 24 * 60 * 60 * 1000);

        this.saveToStorage();
        this.notify();

        // Award XP based on quality
        userStore.addXP(quality >= 4 ? 10 : quality >= 3 ? 5 : 2, 'card_reviewed');
    }

    getCardsForReview(deckId?: string): Flashcard[] {
        const now = Date.now();
        let cards: Flashcard[] = [];

        if (deckId) {
            const deck = this.getDeck(deckId);
            if (deck) cards = deck.cards;
        } else {
            cards = this.decks.flatMap(d => d.cards);
        }

        return cards
            .filter(c => c.nextReviewAt <= now)
            .sort((a, b) => a.nextReviewAt - b.nextReviewAt);
    }

    getDueCount(): number {
        return this.getCardsForReview().length;
    }

    private getRandomColor(): string {
        const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Generate flashcards from AI response
    generateFromConversation(topic: string, content: string): void {
        // Simple extraction - looks for key patterns
        const deck = this.createDeck(topic, `Auto-generated from chat about ${topic}`);

        // Extract Q&A patterns
        const lines = content.split('\n');
        let currentFront = '';

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Look for bold terms as potential card fronts
            const boldMatch = line.match(/\*\*(.+?)\*\*/);
            if (boldMatch && i < lines.length - 1) {
                const front = `What is ${boldMatch[1]}?`;
                const back = lines.slice(i, i + 3).join('\n').replace(/\*\*/g, '');
                if (back.length > 20) {
                    this.addCard(deck.id, front, back, topic);
                }
            }
        }
    }
}

export const flashcardStore = new FlashcardStore();

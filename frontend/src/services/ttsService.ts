// Text-to-Speech Service for StudyWithMe
class TTSService {
    private synth: SpeechSynthesis;
    private currentUtterance: SpeechSynthesisUtterance | null = null;
    private isEnabled: boolean = true;
    private rate: number = 1;
    private pitch: number = 1;
    private volume: number = 1;
    private preferredVoice: SpeechSynthesisVoice | null = null;

    constructor() {
        this.synth = window.speechSynthesis;
        this.loadPreferences();
        this.initVoice();
    }

    private loadPreferences() {
        try {
            const prefs = localStorage.getItem('studywithme_tts');
            if (prefs) {
                const parsed = JSON.parse(prefs);
                this.isEnabled = parsed.enabled ?? true;
                this.rate = parsed.rate ?? 1;
                this.pitch = parsed.pitch ?? 1;
                this.volume = parsed.volume ?? 1;
            }
        } catch (e) {
            // Use defaults
        }
    }

    private savePreferences() {
        localStorage.setItem('studywithme_tts', JSON.stringify({
            enabled: this.isEnabled,
            rate: this.rate,
            pitch: this.pitch,
            volume: this.volume
        }));
    }

    private initVoice() {
        // Wait for voices to load
        if (this.synth.getVoices().length === 0) {
            this.synth.addEventListener('voiceschanged', () => {
                this.selectBestVoice();
            });
        } else {
            this.selectBestVoice();
        }
    }

    private selectBestVoice() {
        const voices = this.synth.getVoices();

        // Prefer Google or Microsoft voices for better quality
        const preferredVoices = voices.filter(v =>
            v.name.includes('Google') ||
            v.name.includes('Microsoft') ||
            v.name.includes('Natural')
        );

        // Pick English voice
        const englishVoices = (preferredVoices.length > 0 ? preferredVoices : voices)
            .filter(v => v.lang.startsWith('en'));

        if (englishVoices.length > 0) {
            this.preferredVoice = englishVoices[0];
        } else if (voices.length > 0) {
            this.preferredVoice = voices[0];
        }
    }

    // Clean text for better speech output
    private cleanText(text: string): string {
        return text
            .replace(/```[\s\S]*?```/g, 'Code block omitted.') // Replace code blocks
            .replace(/`([^`]+)`/g, '$1') // Remove inline code formatting
            .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold formatting
            .replace(/\*([^*]+)\*/g, '$1') // Remove italic formatting
            .replace(/#{1,6}\s*/g, '') // Remove headers
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/\n{3,}/g, '\n\n') // Reduce multiple newlines
            .trim();
    }

    speak(text: string, onStart?: () => void, onEnd?: () => void): void {
        if (!this.isEnabled || !text) return;

        // Cancel any current speech
        this.stop();

        const cleanedText = this.cleanText(text);
        const utterance = new SpeechSynthesisUtterance(cleanedText);

        if (this.preferredVoice) {
            utterance.voice = this.preferredVoice;
        }

        utterance.rate = this.rate;
        utterance.pitch = this.pitch;
        utterance.volume = this.volume;

        utterance.onstart = () => {
            onStart?.();
        };

        utterance.onend = () => {
            this.currentUtterance = null;
            onEnd?.();
        };

        utterance.onerror = (event) => {
            console.error('TTS Error:', event);
            this.currentUtterance = null;
            onEnd?.();
        };

        this.currentUtterance = utterance;
        this.synth.speak(utterance);
    }

    stop(): void {
        this.synth.cancel();
        this.currentUtterance = null;
    }

    pause(): void {
        this.synth.pause();
    }

    resume(): void {
        this.synth.resume();
    }

    isSpeaking(): boolean {
        return this.synth.speaking;
    }

    isPaused(): boolean {
        return this.synth.paused;
    }

    setEnabled(enabled: boolean): void {
        this.isEnabled = enabled;
        if (!enabled) this.stop();
        this.savePreferences();
    }

    setRate(rate: number): void {
        this.rate = Math.max(0.5, Math.min(2, rate));
        this.savePreferences();
    }

    setPitch(pitch: number): void {
        this.pitch = Math.max(0.5, Math.min(2, pitch));
        this.savePreferences();
    }

    setVolume(volume: number): void {
        this.volume = Math.max(0, Math.min(1, volume));
        this.savePreferences();
    }

    getPreferences(): { enabled: boolean; rate: number; pitch: number; volume: number } {
        return {
            enabled: this.isEnabled,
            rate: this.rate,
            pitch: this.pitch,
            volume: this.volume
        };
    }

    getVoices(): SpeechSynthesisVoice[] {
        return this.synth.getVoices().filter(v => v.lang.startsWith('en'));
    }

    setVoice(voiceName: string): void {
        const voice = this.synth.getVoices().find(v => v.name === voiceName);
        if (voice) {
            this.preferredVoice = voice;
        }
    }
}

export const ttsService = new TTSService();

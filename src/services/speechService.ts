export interface VoiceInfo {
  name: string;
  lang: string;
  isUrdu: boolean;
  isEnglish: boolean;
}

export interface AudioPayload {
  audioBase64: string;
  mimeType: string;
}

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private isCancelled: boolean = false;
  private audioCache = new Map<string, AudioPayload>();

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
    return new Promise((resolve) => {
      if (!this.synth) {
        resolve([]);
        return;
      }

      let voices = this.synth.getVoices();
      if (voices.length > 0) {
        resolve(voices);
        return;
      }

      const handler = () => {
        voices = this.synth?.getVoices() || [];
        resolve(voices);
        this.synth?.removeEventListener('voiceschanged', handler);
      };
      this.synth.addEventListener('voiceschanged', handler);

      setTimeout(() => {
        resolve(this.synth?.getVoices() || []);
      }, 500);
    });
  }

  public findBestEnglishVoice(voices: SpeechSynthesisVoice[], preferredName?: string): SpeechSynthesisVoice | null {
    if (preferredName) {
      const match = voices.find(v => v.name === preferredName);
      if (match) return match;
    }

    const usVoices = voices.filter(v => v.lang.toLowerCase() === 'en-us');
    const priorityNames = ['Google US English', 'Samantha', 'Microsoft Zira', 'Alex', 'Daniel'];
    for (const name of priorityNames) {
      const match = usVoices.find(v => v.name.toLowerCase().includes(name.toLowerCase()));
      if (match) return match;
    }

    if (usVoices.length > 0) return usVoices[0];
    return voices.find(v => v.lang.startsWith('en')) || null;
  }

  public findBestUrduVoice(voices: SpeechSynthesisVoice[], preferredName?: string): SpeechSynthesisVoice | null {
    if (preferredName) {
      const match = voices.find(v => v.name === preferredName);
      if (match) return match;
    }

    // Direct Pakistani Urdu voice (ur-PK) has highest priority
    const urPkVoice = voices.find(v => v.lang.toLowerCase() === 'ur-pk');
    if (urPkVoice) return urPkVoice;

    // Any Urdu voice (ur, ur-IN, etc.)
    const urduVoice = voices.find(v => v.lang.toLowerCase().startsWith('ur'));
    if (urduVoice) return urduVoice;

    // Voice name containing urdu or pakistani
    const urduNamed = voices.find(v => 
      v.name.toLowerCase().includes('urdu') || 
      v.name.toLowerCase().includes('pakistan')
    );
    if (urduNamed) return urduNamed;

    // Hindustani phonology voice (hi-IN)
    const hindiVoice = voices.find(v => v.lang.toLowerCase().startsWith('hi'));
    if (hindiVoice) return hindiVoice;

    return null;
  }

  public stop(): void {
    this.isCancelled = true;
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {
        console.warn("Speech synthesis cancel warning:", e);
      }
    }
  }

  public isSpeaking(): boolean {
    const isAudioPlaying = this.currentAudio ? !this.currentAudio.paused : false;
    const isSynthSpeaking = this.synth ? this.synth.speaking : false;
    return isAudioPlaying || isSynthSpeaking;
  }

  /**
   * Generates or fetches authentic Pakistani Urdu audio from backend TTS API.
   * Returns audio payload (base64 + mimeType) or null if unavailable.
   */
  public async fetchPakistaniUrduAudio(text: string): Promise<AudioPayload | null> {
    const cleanText = text.trim();
    const cacheKey = 'v3:' + cleanText;
    if (this.audioCache.has(cacheKey)) {
      return this.audioCache.get(cacheKey)!;
    }

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanText,
          lang: 'ur-PK',
          voice: 'Kore',
        }),
      });

      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      if (data && data.audioBase64) {
        const payload: AudioPayload = {
          audioBase64: data.audioBase64,
          mimeType: data.mimeType || 'audio/mpeg',
        };
        this.audioCache.set(cacheKey, payload);
        return payload;
      }
    } catch {
      // Server TTS unavailable (e.g. offline)
    }
    return null;
  }

  /**
   * Plays audio using native HTML5 Audio element (for server-generated Pakistani Urdu MP3/WAV)
   */
  private playRemoteAudio(payload: AudioPayload, speed: number = 1.0): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.isCancelled) {
        resolve(false);
        return;
      }

      const mime = payload.mimeType || 'audio/mpeg';
      const audio = new Audio(`data:${mime};base64,${payload.audioBase64}`);
      this.currentAudio = audio;
      audio.playbackRate = speed;

      audio.onended = () => {
        this.currentAudio = null;
        resolve(!this.isCancelled);
      };

      audio.onerror = () => {
        this.currentAudio = null;
        resolve(false);
      };

      audio.play().catch(() => {
        this.currentAudio = null;
        resolve(false);
      });
    });
  }

  /**
   * Speaks using Web Speech API as guaranteed client-side fallback
   */
  private speakWithSynth(
    text: string,
    voice: SpeechSynthesisVoice | null,
    lang: string,
    rate: number,
    onBoundary?: (charIndex: number, length?: number) => void
  ): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.isCancelled || !this.synth) {
        resolve(false);
        return;
      }

      // Chrome speech synthesis freeze fix
      try {
        if (this.synth.paused) {
          this.synth.resume();
        }
      } catch {
        // ignore
      }

      const utterance = new SpeechSynthesisUtterance(text);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = lang;
      }

      utterance.rate = rate;
      utterance.pitch = 1.0;

      utterance.onboundary = (event) => {
        if (!this.isCancelled && onBoundary) {
          onBoundary(event.charIndex, event.charLength);
        }
      };

      utterance.onend = () => {
        this.currentUtterance = null;
        resolve(!this.isCancelled);
      };

      utterance.onerror = (e) => {
        this.currentUtterance = null;
        if (e.error === 'canceled' || this.isCancelled) {
          resolve(false);
        } else {
          // Recover gracefully
          resolve(false);
        }
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);

      // Safety watchdog in case browser never fires onend
      setTimeout(() => {
        if (this.currentUtterance === utterance) {
          this.currentUtterance = null;
          resolve(!this.isCancelled);
        }
      }, 15000);
    });
  }

  /**
   * Speaks English sentence, and consecutively speaks authentic Pakistani Urdu voice translation!
   */
  public async playSentenceBilingual({
    englishText,
    urduText,
    romanUrduText,
    mode = 'both',
    speed = 1.0,
    preferredEnglishVoice,
    preferredUrduVoice,
    onLangChange,
    onBoundary,
    onFinish,
    onError,
  }: {
    englishText: string;
    urduText: string;
    romanUrduText: string;
    mode?: 'both' | 'english_only' | 'urdu_only';
    speed?: number;
    preferredEnglishVoice?: string;
    preferredUrduVoice?: string;
    onLangChange?: (lang: 'en' | 'ur') => void;
    onBoundary?: (charIndex: number, length?: number) => void;
    onFinish?: () => void;
    onError?: (err: any) => void;
  }): Promise<void> {
    this.stop();
    this.isCancelled = false;

    const voices = await this.getAvailableVoices();
    const enVoice = this.findBestEnglishVoice(voices, preferredEnglishVoice);
    const urVoice = this.findBestUrduVoice(voices, preferredUrduVoice);

    const playPakistaniUrdu = async (): Promise<boolean> => {
      onLangChange?.('ur');

      // 1. Try high-fidelity server-side Pakistani Urdu voice first
      const remotePayload = await this.fetchPakistaniUrduAudio(urduText);
      if (remotePayload && !this.isCancelled) {
        const played = await this.playRemoteAudio(remotePayload, speed);
        if (played) return true;
      }

      if (this.isCancelled) return false;

      // 2. Fallback to client browser SpeechSynthesis with Pakistani Urdu / Hindustani phonology
      const langCode = urVoice ? urVoice.lang : 'ur-PK';
      const textToSpeak = urVoice ? urduText : (romanUrduText || urduText);
      return await this.speakWithSynth(textToSpeak, urVoice, langCode, Math.max(0.75, speed * 0.95), onBoundary);
    };

    try {
      if (mode === 'urdu_only') {
        const urCompleted = await playPakistaniUrdu();
        if (urCompleted && !this.isCancelled) onFinish?.();
        return;
      }

      // Step 1: Speak English
      onLangChange?.('en');
      const enCompleted = await this.speakWithSynth(
        englishText,
        enVoice,
        'en-US',
        speed,
        onBoundary
      );

      if (!enCompleted || this.isCancelled) {
        return;
      }

      // Step 2: Speak Pakistani Urdu voice consecutively
      if (mode === 'both') {
        // Natural pause between English and Urdu
        await new Promise((res) => setTimeout(res, 450));

        if (this.isCancelled) return;

        const urCompleted = await playPakistaniUrdu();
        if (!urCompleted || this.isCancelled) return;
      }

      if (!this.isCancelled) {
        onFinish?.();
      }
    } catch (error) {
      if (!this.isCancelled) {
        onError?.(error);
      }
    }
  }
}

export const speechService = new SpeechService();

import { useState, useRef, useEffect, useCallback } from 'react';
import { SentenceRecordData } from '../types';

interface UseAudioRecorderProps {
  targetSentence?: string;
  onRecordingComplete?: (data: SentenceRecordData) => void;
}

// Clean string for word-by-word comparison
function cleanTokens(str: string): string[] {
  return str
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, '')
    .split(/\s+/)
    .filter(Boolean);
}

// Word comparison and similarity score
export function calculatePronunciationScore(target: string, spoken: string): {
  score: number;
  wordMatches: { word: string; matched: boolean }[];
} {
  const targetWords = cleanTokens(target);
  const spokenWords = cleanTokens(spoken);

  if (targetWords.length === 0) {
    return { score: 0, wordMatches: [] };
  }

  const spokenSet = new Set(spokenWords);
  let matchedCount = 0;

  const wordMatches = targetWords.map((word) => {
    // Exact or near match
    const isMatched = spokenSet.has(word) || spokenWords.some((sw) => {
      if (Math.abs(sw.length - word.length) <= 1) {
        let diff = 0;
        for (let i = 0; i < Math.min(sw.length, word.length); i++) {
          if (sw[i] !== word[i]) diff++;
        }
        return diff <= 1;
      }
      return false;
    });

    if (isMatched) matchedCount++;
    return { word, matched: isMatched };
  });

  const rawScore = Math.round((matchedCount / targetWords.length) * 100);
  // Give minimum baseline for effort if words were recognized
  const score = spokenWords.length > 0 ? Math.max(15, rawScore) : 0;

  return { score, wordMatches };
}

export function useAudioRecorder({ targetSentence, onRecordingComplete }: UseAudioRecorderProps = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState(false);
  const [recordedData, setRecordedData] = useState<SentenceRecordData | null>(null);
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState<boolean | null>(null);
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize SpeechRecognition if available
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setSpeechRecognitionSupported(true);
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript + ' ';
          }
          setTranscript(currentTranscript.trim());
        };

        recognition.onerror = () => {
          // Non-fatal recognition error
        };

        recognitionRef.current = recognition;
      } catch (e) {
        console.warn("Speech recognition initialization failed:", e);
      }
    }
  }, []);

  // Timer while recording
  useEffect(() => {
    if (isRecording) {
      setRecordingDuration(0);
      timerRef.current = window.setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const startRecording = useCallback(async () => {
    setErrorMessage(null);
    setTranscript('');
    setRecordedData(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasMicrophonePermission(true);

      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';

      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || 'audio/webm',
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Calculate comparison score
        const { score, wordMatches } = targetSentence
          ? calculatePronunciationScore(targetSentence, transcript)
          : { score: 85, wordMatches: [] };

        const completeData: SentenceRecordData = {
          audioUrl: url,
          blob: audioBlob,
          transcription: transcript,
          score,
          recordedAt: Date.now(),
          wordMatches,
        };

        setRecordedData(completeData);
        onRecordingComplete?.(completeData);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(200);
      setIsRecording(true);

      // Start recognition if available
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          // May already be running
        }
      }
    } catch (err: any) {
      setHasMicrophonePermission(false);
      setErrorMessage(
        err.name === 'NotAllowedError'
          ? "Microphone access was denied. Please allow microphone permissions in your browser."
          : "Could not access microphone on this device."
      );
    }
  }, [audioUrl, targetSentence, transcript, onRecordingComplete]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Recognition already stopped
      }
    }
  }, []);

  const playRecordedAudio = useCallback(() => {
    if (!audioUrl) return;

    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
    }

    const player = new Audio(audioUrl);
    audioPlayerRef.current = player;
    setIsPlayingRecorded(true);

    player.onended = () => {
      setIsPlayingRecorded(false);
    };
    player.onerror = () => {
      setIsPlayingRecorded(false);
    };

    player.play().catch(() => {
      setIsPlayingRecorded(false);
    });
  }, [audioUrl]);

  const stopRecordedAudio = useCallback(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      setIsPlayingRecorded(false);
    }
  }, []);

  return {
    isRecording,
    recordingDuration,
    audioUrl,
    isPlayingRecorded,
    recordedData,
    transcript,
    hasMicrophonePermission,
    speechRecognitionSupported,
    errorMessage,
    startRecording,
    stopRecording,
    playRecordedAudio,
    stopRecordedAudio,
  };
}

export interface PracticeSentence {
  id: string;
  sceneId: number;
  speaker: string;
  speakerUrdu: string;
  english: string;
  urdu: string;
  romanUrdu: string;
  vocabTip?: string;
  grammarNote?: string;
}

export interface Scene {
  id: number;
  title: string;
  titleUrdu: string;
  titleRoman: string;
  category: string;
  categoryUrdu: string;
  description: string;
  descriptionUrdu: string;
  iconName: string;
  sentences: PracticeSentence[];
}

export type AudioPlayMode = 'both' | 'english_only' | 'urdu_only';

export interface AudioSettings {
  mode: AudioPlayMode;
  speed: number;
  autoPlayNext: boolean;
  repeatTimes: number;
  showUrduScript: boolean;
  showRomanUrdu: boolean;
  showVocabTips: boolean;
  englishVoiceName: string;
  urduVoiceName: string;
}

export interface SentenceRecordData {
  audioUrl: string;
  blob: Blob;
  transcription: string;
  score: number; // 0 - 100
  recordedAt: number;
  wordMatches: {
    word: string;
    matched: boolean;
  }[];
}

export interface UserProgress {
  completedSceneIds: number[];
  practicedSentenceIds: string[];
  recordedSentenceIds: string[];
  bookmarkedSentenceIds: string[];
  streakDays: number;
  lastActiveDate: string;
  sentenceScores: Record<string, number>;
}

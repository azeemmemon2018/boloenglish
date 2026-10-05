import React from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, RotateCcw, 
  Gauge, Volume2, Globe, Sparkles 
} from 'lucide-react';
import { AudioSettings, AudioPlayMode } from '../types';

interface AudioControlsBarProps {
  isPlaying: boolean;
  activeLanguage: 'en' | 'ur' | null;
  settings: AudioSettings;
  onTogglePlay: () => void;
  onNextSentence: () => void;
  onPrevSentence: () => void;
  onUpdateSettings: (newSettings: Partial<AudioSettings>) => void;
  sentenceIndex: number;
  totalSentences: number;
}

export const AudioControlsBar: React.FC<AudioControlsBarProps> = ({
  isPlaying,
  activeLanguage,
  settings,
  onTogglePlay,
  onNextSentence,
  onPrevSentence,
  onUpdateSettings,
  sentenceIndex,
  totalSentences,
}) => {
  const speeds = [0.75, 0.9, 1.0, 1.15, 1.25];

  const handleModeChange = (mode: AudioPlayMode) => {
    onUpdateSettings({ mode });
  };

  return (
    <div className="bg-slate-900/95 border-t border-slate-800 p-3 sm:p-4 backdrop-blur-md shadow-2xl">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Audio Mode Selector (English + Urdu Voice) */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto justify-center">
          <button
            onClick={() => handleModeChange('both')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              settings.mode === 'both'
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Sentence plays in English, then automatically speaks Urdu translation voice"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>EN + اردو آواز</span>
          </button>
          
          <button
            onClick={() => handleModeChange('english_only')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              settings.mode === 'english_only'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            title="English voice only"
          >
            Only English
          </button>

          <button
            onClick={() => handleModeChange('urdu_only')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium font-urdu transition ${
              settings.mode === 'urdu_only'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            title="صرف پاکستانی اردو آواز سنیں"
          >
            🇵🇰 صرف اردو آواز
          </button>
        </div>

        {/* Center: Main Playback Controls */}
        <div className="flex items-center gap-3">
          {/* Previous sentence */}
          <button
            onClick={onPrevSentence}
            disabled={sentenceIndex <= 0}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-200 transition"
            title="Previous sentence"
            aria-label="Previous sentence"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Master Play / Pause */}
          <button
            onClick={onTogglePlay}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold shadow-lg shadow-teal-500/20 active:scale-95 transition"
            title={isPlaying ? "Pause audio" : "Play sentence with Urdu voice translation"}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-slate-950" />
            ) : (
              <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
            )}
          </button>

          {/* Next sentence */}
          <button
            onClick={onNextSentence}
            disabled={sentenceIndex >= totalSentences - 1}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-200 transition"
            title="Next sentence"
            aria-label="Next sentence"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Live Speaking Status Badge */}
          {isPlaying && activeLanguage && (
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-xs">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
              <span className="text-teal-300 font-medium">
                {activeLanguage === 'en' ? 'Speaking English...' : '🇵🇰 پاکستانی اردو آواز...'}
              </span>
            </div>
          )}
        </div>

        {/* Right: Speed Controls & Auto-advance */}
        <div className="flex items-center gap-3">
          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800">
            <Gauge className="w-3.5 h-3.5 text-slate-400 mr-1 hidden sm:block" />
            {speeds.map((s) => (
              <button
                key={s}
                onClick={() => onUpdateSettings({ speed: s })}
                className={`px-1.5 py-0.5 rounded text-[11px] font-semibold transition ${
                  settings.speed === s
                    ? 'bg-teal-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Auto-play toggle */}
          <button
            onClick={() => onUpdateSettings({ autoPlayNext: !settings.autoPlayNext })}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
              settings.autoPlayNext
                ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Automatically play the next sentence when finished"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Auto-Next</span>
          </button>
        </div>
      </div>
    </div>
  );
};

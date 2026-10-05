import React from 'react';
import { 
  X, Award, Flame, CheckCircle2, Mic, Star, 
  BarChart2, BookOpen, Volume2 
} from 'lucide-react';
import { UserProgress, Scene } from '../types';
import { allCategories } from '../data/allScenes';

interface ProgressStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: UserProgress;
  scenes: Scene[];
  onSelectScene: (scene: Scene) => void;
}

export const ProgressStatsModal: React.FC<ProgressStatsModalProps> = ({
  isOpen,
  onClose,
  progress,
  scenes,
  onSelectScene,
}) => {
  if (!isOpen) return null;

  const totalScenes = scenes.length;
  const completedCount = progress.completedSceneIds.length;
  const progressPercent = Math.round((completedCount / totalScenes) * 100);

  // Calculate average pronunciation score
  const scores = Object.values(progress.sentenceScores);
  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  // Find bookmarked sentences
  const bookmarkedSentences = scenes
    .flatMap((s) => s.sentences)
    .filter((sent) => progress.bookmarkedSentenceIds.includes(sent.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-400">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Your Speaking & Listening Progress</h3>
              <p className="text-xs text-slate-400 font-urdu">آپ کی کارکردگی اور اعداد و شمار</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Key Stat Cards */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Card 1: Completed Scenes */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-1.5 text-teal-400 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-[11px] font-bold">Scenes</span>
            </div>
            <div className="text-xl font-extrabold text-white">
              {completedCount} <span className="text-xs font-normal text-slate-400">/ {totalScenes}</span>
            </div>
            <span className="text-[10px] text-slate-400">{progressPercent}% Completed</span>
          </div>

          {/* Card 2: Streak */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-1.5 text-amber-400 mb-1">
              <Flame className="w-4 h-4 animate-pulse" />
              <span className="text-[11px] font-bold">Daily Streak</span>
            </div>
            <div className="text-xl font-extrabold text-amber-300">
              {progress.streakDays || 1} <span className="text-xs font-normal text-slate-400">Days</span>
            </div>
            <span className="text-[10px] text-slate-400">Keep it up! 🔥</span>
          </div>

          {/* Card 3: Voice Recordings */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-1.5 text-cyan-400 mb-1">
              <Mic className="w-4 h-4" />
              <span className="text-[11px] font-bold">Recordings</span>
            </div>
            <div className="text-xl font-extrabold text-white">
              {progress.recordedSentenceIds.length}
            </div>
            <span className="text-[10px] text-slate-400">Practiced aloud</span>
          </div>

          {/* Card 4: Pronunciation Score */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-1.5 text-emerald-400 mb-1">
              <Award className="w-4 h-4" />
              <span className="text-[11px] font-bold">Avg Accuracy</span>
            </div>
            <div className="text-xl font-extrabold text-emerald-300">
              {avgScore > 0 ? `${avgScore}%` : '--'}
            </div>
            <span className="text-[10px] text-slate-400">Pronunciation</span>
          </div>
        </div>

        {/* Category Completion Breakdown */}
        <div className="mt-6">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
            Category Breakdown / شعبہ جاتی پیشرفت
          </h4>
          <div className="space-y-2.5">
            {allCategories.filter((c) => c.name !== 'All').map((cat) => {
              const catScenes = scenes.filter((s) => s.category === cat.name);
              const catCompleted = catScenes.filter((s) => progress.completedSceneIds.includes(s.id)).length;
              const catPercent = catScenes.length > 0 ? Math.round((catCompleted / catScenes.length) * 100) : 0;

              return (
                <div key={cat.name} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-200">
                      {cat.name} <span className="font-urdu text-[11px] text-slate-400">({cat.nameUrdu})</span>
                    </span>
                    <span className="text-slate-400 font-medium">
                      {catCompleted}/{catScenes.length} ({catPercent}%)
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-500"
                      style={{ width: `${catPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bookmarked / Saved Sentences */}
        {bookmarkedSentences.length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-800">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>Bookmarked Sentences ({bookmarkedSentences.length})</span>
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {bookmarkedSentences.map((sent) => (
                <div
                  key={sent.id}
                  onClick={() => {
                    const scene = scenes.find((s) => s.id === sent.sceneId);
                    if (scene) {
                      onSelectScene(scene);
                      onClose();
                    }
                  }}
                  className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800/60 border border-slate-800 cursor-pointer transition"
                >
                  <p className="text-xs font-semibold text-slate-200">{sent.english}</p>
                  <p className="text-xs font-urdu text-teal-300 text-right mt-0.5">{sent.urdu}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition shadow-md"
          >
            Close / بند کریں
          </button>
        </div>
      </div>
    </div>
  );
};

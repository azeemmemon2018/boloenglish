import React from 'react';
import { Volume2, Award, Flame, Settings, BarChart2, BookOpen } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { UserProgress } from '../types';

interface HeaderProps {
  progress: UserProgress;
  totalScenes: number;
  onOpenStats: () => void;
  onOpenSettings: () => void;
  onNavigateHome: () => void;
  activeSceneTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  progress,
  totalScenes,
  onOpenStats,
  onOpenSettings,
  onNavigateHome,
  activeSceneTitle,
}) => {
  const completedCount = progress.completedSceneIds.length;
  const progressPercent = Math.round((completedCount / totalScenes) * 100);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Logo / Brand */}
        <div 
          onClick={onNavigateHome}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 via-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-teal-900/30 group-hover:scale-105 transition">
            <Volume2 className="w-5 h-5 text-teal-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-teal-300 via-cyan-200 to-emerald-300 bg-clip-text text-transparent">
                EngUrdu Speak
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                {totalScenes} Situations
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block font-urdu">
              انگریزی سنیں اور بولیں — ہر جملے کے بعد اردو ترجمہ کی آواز
            </p>
          </div>
        </div>

        {/* Center Scene Title when practicing */}
        {activeSceneTitle && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700 max-w-sm truncate text-xs text-slate-200">
            <BookOpen className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span className="truncate font-medium">{activeSceneTitle}</span>
          </div>
        )}

        {/* Right side actions & stats */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Daily Streak */}
          <div 
            onClick={onOpenStats}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 cursor-pointer hover:bg-amber-500/20 transition text-xs font-semibold"
            title="Daily Practice Streak"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>{progress.streakDays || 1} <span className="hidden sm:inline">Days</span></span>
          </div>

          {/* Completed counter */}
          <div 
            onClick={onOpenStats}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-300 cursor-pointer hover:bg-teal-500/20 transition text-xs font-semibold"
            title="Completed Scenes"
          >
            <Award className="w-3.5 h-3.5 text-teal-400" />
            <span>{completedCount}/{totalScenes} ({progressPercent}%)</span>
          </div>

          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Progress / Stats Modal Button */}
          <button
            onClick={onOpenStats}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700/60"
            title="Practice Progress & Stats"
            aria-label="Progress Statistics"
          >
            <BarChart2 className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700/60"
            title="Audio & Language Settings"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>
    </header>
  );
};

import React, { useState, useMemo } from 'react';
import { 
  Search, CheckCircle2, Volume2, Sparkles, Filter, 
  Flame, BookOpen, Star, Play, Mic, ChevronRight 
} from 'lucide-react';
import { Scene, UserProgress } from '../types';
import { allCategories } from '../data/allScenes';

interface SceneListProps {
  scenes: Scene[];
  progress: UserProgress;
  onSelectScene: (scene: Scene) => void;
  onOpenStats: () => void;
}

export const SceneList: React.FC<SceneListProps> = ({
  scenes,
  progress,
  onSelectScene,
  onOpenStats,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'in_progress'>('all');

  const filteredScenes = useMemo(() => {
    return scenes.filter((scene) => {
      // Category match
      if (selectedCategory !== 'All' && scene.category !== selectedCategory) {
        return false;
      }

      // Status match
      const isCompleted = progress.completedSceneIds.includes(scene.id);
      if (statusFilter === 'completed' && !isCompleted) return false;
      if (statusFilter === 'in_progress' && isCompleted) return false;

      // Search match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = scene.title.toLowerCase().includes(query);
        const matchesTitleUrdu = scene.titleUrdu.includes(query);
        const matchesTitleRoman = scene.titleRoman.toLowerCase().includes(query);
        const matchesCategory = scene.category.toLowerCase().includes(query);
        const matchesSentences = scene.sentences.some(
          (s) =>
            s.english.toLowerCase().includes(query) ||
            s.urdu.includes(query) ||
            s.romanUrdu.toLowerCase().includes(query)
        );

        return matchesTitle || matchesTitleUrdu || matchesTitleRoman || matchesCategory || matchesSentences;
      }

      return true;
    });
  }, [scenes, selectedCategory, statusFilter, searchQuery, progress.completedSceneIds]);

  const completedCount = progress.completedSceneIds.length;
  const progressPercent = Math.round((completedCount / scenes.length) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-900 via-slate-900 to-indigo-950 p-6 sm:p-8 border border-teal-500/30 shadow-2xl mb-8">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Intermediate Daily Workplace English & Urdu Voice</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {scenes.length} Daily Routine & Life English Situations
          </h1>

          <p className="mt-2 text-base sm:text-lg text-teal-200 font-urdu leading-loose">
            ہر انگریزی جملے کے بعد اس کا اردو ترجمہ آواز کے ساتھ سنیں اور بولنے کی روانی بہتر بنائیں!
          </p>

          <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Practice listening and pronunciation with native audio, Urdu translation voice, instant microphone recording comparison, and offline access.
          </p>

          {/* Quick Metrics Bar */}
          <div className="mt-6 flex flex-wrap items-center gap-4 sm:gap-6 pt-5 border-t border-slate-700/60 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
              <span className="text-slate-300">
                Progress: <strong className="text-white">{completedCount} of {scenes.length} Situations</strong> ({progressPercent}%)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-slate-300">
                Active Streak: <strong className="text-amber-300">{progress.streakDays || 1} Days</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span className="text-slate-300">
                Voice Recordings: <strong className="text-cyan-300">{progress.recordedSentenceIds.length} Practiced</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search bar */}
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, English words, or Urdu (مثلاً: meeting, alarm, کافی)..."
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Status filter pills */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-2xl border border-slate-800 self-stretch sm:self-auto justify-center">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                statusFilter === 'all'
                  ? 'bg-teal-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All (50)
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition ${
                statusFilter === 'completed'
                  ? 'bg-teal-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Completed ({completedCount})
            </button>
            <button
              onClick={() => setStatusFilter('in_progress')}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition ${
                statusFilter === 'in_progress'
                  ? 'bg-teal-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Remaining ({50 - completedCount})
            </button>
          </div>
        </div>

        {/* Categories scrollable pill row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-1">
          {allCategories.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-medium transition shrink-0 ${
                  isSelected
                    ? 'bg-teal-600 text-white font-semibold shadow-md shadow-teal-900/30 ring-1 ring-teal-400/40'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                <span>{cat.name}</span>
                <span className="ml-1 text-[10px] text-teal-300/80 font-urdu">{cat.nameUrdu}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Scenes */}
      {filteredScenes.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-slate-900/40 border border-slate-800">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">No scenes match your search</h3>
          <p className="text-xs text-slate-500 mt-1">Try another keyword or reset the category filter.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setStatusFilter('all');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold"
          >
            Show All {scenes.length} Situations
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredScenes.map((scene) => {
            const isCompleted = progress.completedSceneIds.includes(scene.id);
            const practicedCount = scene.sentences.filter((s) =>
              progress.practicedSentenceIds.includes(s.id)
            ).length;

            return (
              <div
                key={scene.id}
                onClick={() => onSelectScene(scene)}
                className="group relative cursor-pointer flex flex-col justify-between rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-teal-500/50 p-5 shadow-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-teal-950/20"
              >
                <div>
                  {/* Top row: Scene number & Category */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-teal-300 border border-slate-700">
                      <span>Scene {scene.id}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        {scene.category}
                      </span>
                      {isCompleted && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                  </div>

                  {/* Title in English */}
                  <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors line-clamp-1">
                    {scene.title}
                  </h3>

                  {/* Title in Urdu script */}
                  <p className="mt-1 font-urdu text-sm text-teal-200/90 text-right line-clamp-1 leading-normal">
                    {scene.titleUrdu}
                  </p>

                  {/* Description preview */}
                  <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {scene.description}
                  </p>

                  {/* Preview first English sentence */}
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <p className="text-[11px] text-slate-300 italic line-clamp-1">
                      "{scene.sentences[0]?.english}"
                    </p>
                  </div>
                </div>

                {/* Footer action & stats */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>{scene.sentences.length} Sentences</span>
                    <span>•</span>
                    <span className="text-teal-400 flex items-center gap-1">
                      <Volume2 className="w-3 h-3" />
                      EN + اردو
                    </span>
                  </div>

                  <span className="flex items-center gap-1 text-xs font-bold text-teal-400 group-hover:translate-x-0.5 transition-transform">
                    <span>Practice</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

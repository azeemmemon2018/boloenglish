import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Volume2, Sparkles, Star, Mic, CheckCircle, 
  ChevronRight, ChevronLeft, HelpCircle, BookOpen, Share2, Code2 
} from 'lucide-react';
import { Scene, PracticeSentence, AudioSettings, UserProgress } from '../types';
import { speechService } from '../services/speechService';
import { AudioControlsBar } from './AudioControlsBar';
import { VoiceCompareWidget } from './VoiceCompareWidget';
import { StructuredDataModal } from './StructuredDataModal';
import confetti from 'canvas-confetti';

interface ScenePlayerProps {
  scene: Scene;
  settings: AudioSettings;
  progress: UserProgress;
  onBack: () => void;
  onUpdateSettings: (newSettings: Partial<AudioSettings>) => void;
  onUpdateProgress: (updater: (prev: UserProgress) => UserProgress) => void;
  onNextScene?: () => void;
  onPrevScene?: () => void;
}

export const ScenePlayer: React.FC<ScenePlayerProps> = ({
  scene,
  settings,
  progress,
  onBack,
  onUpdateSettings,
  onUpdateProgress,
  onNextScene,
  onPrevScene,
}) => {
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeVoiceLanguage, setActiveVoiceLanguage] = useState<'en' | 'ur' | null>(null);
  const [highlightedCharIndex, setHighlightedCharIndex] = useState<number | null>(null);
  const [activeRecordingSentenceId, setActiveRecordingSentenceId] = useState<string | null>(null);
  const [isStructuredModalOpen, setIsStructuredModalOpen] = useState(false);

  const sentences = scene.sentences;
  const currentSentence = sentences[currentSentenceIndex] || sentences[0];

  // Stop audio on unmount or scene change
  useEffect(() => {
    return () => {
      speechService.stop();
      setIsPlaying(false);
      setActiveVoiceLanguage(null);
    };
  }, [scene.id]);

  // Mark sentence as practiced
  const markSentencePracticed = (sentenceId: string) => {
    onUpdateProgress((prev) => {
      if (!prev.practicedSentenceIds.includes(sentenceId)) {
        return {
          ...prev,
          practicedSentenceIds: [...prev.practicedSentenceIds, sentenceId],
        };
      }
      return prev;
    });
  };

  // Toggle bookmark / favorite
  const toggleBookmark = (sentenceId: string) => {
    onUpdateProgress((prev) => {
      const isBookmarked = prev.bookmarkedSentenceIds.includes(sentenceId);
      return {
        ...prev,
        bookmarkedSentenceIds: isBookmarked
          ? prev.bookmarkedSentenceIds.filter((id) => id !== sentenceId)
          : [...prev.bookmarkedSentenceIds, sentenceId],
      };
    });
  };

  // Play a specific sentence (English followed immediately by Urdu voice translation!)
  const playSentence = async (index: number) => {
    const target = sentences[index];
    if (!target) return;

    setCurrentSentenceIndex(index);
    setIsPlaying(true);
    markSentencePracticed(target.id);

    try {
      await speechService.playSentenceBilingual({
        englishText: target.english,
        urduText: target.urdu,
        romanUrduText: target.romanUrdu,
        mode: settings.mode,
        speed: settings.speed,
        preferredEnglishVoice: settings.englishVoiceName,
        preferredUrduVoice: settings.urduVoiceName,
        onLangChange: (lang) => {
          setActiveVoiceLanguage(lang);
        },
        onBoundary: (charIndex) => {
          setHighlightedCharIndex(charIndex);
        },
        onFinish: () => {
          setIsPlaying(false);
          setActiveVoiceLanguage(null);
          setHighlightedCharIndex(null);

          // If autoPlayNext is enabled
          if (settings.autoPlayNext) {
            if (index < sentences.length - 1) {
              setTimeout(() => {
                playSentence(index + 1);
              }, 600);
            } else {
              // Scene completed!
              markSceneCompleted();
            }
          }
        },
        onError: () => {
          setIsPlaying(false);
          setActiveVoiceLanguage(null);
          setHighlightedCharIndex(null);
        },
      });
    } catch {
      setIsPlaying(false);
      setActiveVoiceLanguage(null);
    }
  };

  const playUrduOnly = async (index: number) => {
    const target = sentences[index];
    if (!target) return;

    setCurrentSentenceIndex(index);
    setIsPlaying(true);
    setActiveVoiceLanguage('ur');

    try {
      await speechService.playSentenceBilingual({
        englishText: target.english,
        urduText: target.urdu,
        romanUrduText: target.romanUrdu,
        mode: 'urdu_only',
        speed: settings.speed,
        preferredUrduVoice: settings.urduVoiceName,
        onLangChange: (lang) => setActiveVoiceLanguage(lang),
        onFinish: () => {
          setIsPlaying(false);
          setActiveVoiceLanguage(null);
        },
        onError: () => {
          setIsPlaying(false);
          setActiveVoiceLanguage(null);
        },
      });
    } catch {
      setIsPlaying(false);
      setActiveVoiceLanguage(null);
    }
  };

  const markSceneCompleted = () => {
    onUpdateProgress((prev) => {
      if (!prev.completedSceneIds.includes(scene.id)) {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
        });
        return {
          ...prev,
          completedSceneIds: [...prev.completedSceneIds, scene.id],
        };
      }
      return prev;
    });
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      speechService.stop();
      setIsPlaying(false);
      setActiveVoiceLanguage(null);
    } else {
      playSentence(currentSentenceIndex);
    }
  };

  const handleNext = () => {
    speechService.stop();
    setIsPlaying(false);
    setActiveVoiceLanguage(null);
    if (currentSentenceIndex < sentences.length - 1) {
      const nextIdx = currentSentenceIndex + 1;
      setCurrentSentenceIndex(nextIdx);
      if (settings.autoPlayNext) {
        playSentence(nextIdx);
      }
    }
  };

  const handlePrev = () => {
    speechService.stop();
    setIsPlaying(false);
    setActiveVoiceLanguage(null);
    if (currentSentenceIndex > 0) {
      const prevIdx = currentSentenceIndex - 1;
      setCurrentSentenceIndex(prevIdx);
      if (settings.autoPlayNext) {
        playSentence(prevIdx);
      }
    }
  };

  const handleSaveScore = (sentenceId: string, score: number) => {
    onUpdateProgress((prev) => ({
      ...prev,
      recordedSentenceIds: Array.from(new Set([...prev.recordedSentenceIds, sentenceId])),
      sentenceScores: {
        ...prev.sentenceScores,
        [sentenceId]: score,
      },
    }));
  };

  const isCompleted = progress.completedSceneIds.includes(scene.id);

  return (
    <div className="min-h-[calc(100vh-60px)] flex flex-col justify-between bg-slate-950 pb-28">
      {/* Top Scene Subheader */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-3.5 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-teal-400 transition group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>All Scenes / تمام سینز</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsStructuredModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 transition"
              title="View clean structured learning content (JSON) for en-US and ur-PK voice engines"
            >
              <Code2 className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">Voice JSON</span>
              <span className="text-[10px] font-mono opacity-80">(en-US / ur-PK)</span>
            </button>

            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Scene {scene.id} of 50
            </span>
            {isCompleted && (
              <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>مکمل</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Interactive Practice Container */}
      <main className="max-w-4xl mx-auto px-4 py-6 w-full flex-1">
        {/* Scene Title Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-teal-950/40 via-slate-900 to-indigo-950/40 border border-teal-500/20 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400">
                {scene.category} • {scene.categoryUrdu}
              </span>
              <h1 className="text-lg sm:text-xl font-extrabold text-white mt-0.5 tracking-tight">
                {scene.title}
              </h1>
              <p className="text-sm font-urdu text-teal-200 mt-1">
                {scene.titleUrdu}
              </p>
            </div>

            {/* Sentence Progress Bubbles */}
            <div className="flex items-center gap-1.5 self-start sm:self-center mt-2 sm:mt-0">
              {sentences.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    speechService.stop();
                    setIsPlaying(false);
                    setCurrentSentenceIndex(i);
                  }}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                    currentSentenceIndex === i
                      ? 'bg-teal-500 text-slate-950 ring-2 ring-teal-400 shadow-md scale-105'
                      : progress.practicedSentenceIds.includes(sentences[i].id)
                      ? 'bg-slate-800 text-teal-300 border border-teal-500/30'
                      : 'bg-slate-800/60 text-slate-500 border border-slate-700/60 hover:text-slate-300'
                  }`}
                  title={`Sentence ${i + 1}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Current Active Sentence Cards */}
        <div className="space-y-4">
          {sentences.map((sent, index) => {
            const isCurrent = currentSentenceIndex === index;
            const isCurrentlySpeakingThis = isCurrent && isPlaying;
            const isBookmarked = progress.bookmarkedSentenceIds.includes(sent.id);
            const score = progress.sentenceScores[sent.id];
            const isRecordingOpen = activeRecordingSentenceId === sent.id;

            return (
              <div
                key={sent.id}
                className={`rounded-2xl transition-all duration-200 border ${
                  isCurrent
                    ? 'bg-slate-900 border-teal-500/50 shadow-xl ring-1 ring-teal-500/20'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 opacity-90'
                }`}
              >
                {/* Sentence Header Row */}
                <div className="p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-400 border border-teal-500/20">
                        {sent.speaker} ({sent.speakerUrdu})
                      </span>
                      {score !== undefined && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {score}% Pronounced
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Bookmark button */}
                      <button
                        onClick={() => toggleBookmark(sent.id)}
                        className={`p-1.5 rounded-lg transition ${
                          isBookmarked
                            ? 'text-amber-400 bg-amber-500/10'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                        title={isBookmarked ? "Remove bookmark" : "Bookmark sentence"}
                      >
                        <Star className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
                      </button>

                      {/* Play this sentence button */}
                      <button
                        onClick={() => {
                          if (isCurrentlySpeakingThis) {
                            speechService.stop();
                            setIsPlaying(false);
                            setActiveVoiceLanguage(null);
                          } else {
                            playSentence(index);
                          }
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs shadow-md transition active:scale-95 ${
                          isCurrentlySpeakingThis
                            ? 'bg-rose-500 text-white'
                            : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950'
                        }`}
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>{isCurrentlySpeakingThis ? 'Pause' : 'Listen / سنیں'}</span>
                      </button>
                    </div>
                  </div>

                  {/* English Sentence Text */}
                  <div className="mb-3">
                    <p className={`text-base sm:text-lg font-semibold leading-relaxed transition-colors ${
                      isCurrentlySpeakingThis && activeVoiceLanguage === 'en'
                        ? 'text-cyan-300'
                        : 'text-slate-100'
                    }`}>
                      {sent.english}
                    </p>
                  </div>

                  {/* Urdu Translation Text */}
                  {settings.showUrduScript && (
                    <div className={`pt-2.5 border-t border-slate-800/80 transition-colors ${
                      isCurrentlySpeakingThis && activeVoiceLanguage === 'ur'
                        ? 'text-emerald-300'
                        : 'text-slate-300'
                    }`}>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <button
                          onClick={() => {
                            if (isCurrentlySpeakingThis && activeVoiceLanguage === 'ur') {
                              speechService.stop();
                              setIsPlaying(false);
                              setActiveVoiceLanguage(null);
                            } else {
                              playUrduOnly(index);
                            }
                          }}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold font-urdu transition border ${
                            isCurrentlySpeakingThis && activeVoiceLanguage === 'ur'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          }`}
                          title="پاکستانی اردو لہجے میں آواز سنیں"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>
                            {isCurrentlySpeakingThis && activeVoiceLanguage === 'ur'
                              ? 'آواز روکیں'
                              : 'پاکستانی اردو آواز سنیں'}
                          </span>
                        </button>

                        <span className="text-[11px] font-urdu text-teal-400/80 bg-teal-500/10 px-2 py-0.5 rounded-md border border-teal-500/20">
                          پاکستانی لہجہ
                        </span>
                      </div>

                      <p className="font-urdu text-base sm:text-lg text-right font-medium leading-loose text-slate-200">
                        {sent.urdu}
                      </p>
                    </div>
                  )}

                  {/* Roman Urdu Transliteration */}
                  {settings.showRomanUrdu && (
                    <div className="mt-1">
                      <p className="text-xs sm:text-sm text-slate-400 italic">
                        <span className="font-semibold text-slate-500 not-italic mr-1.5">Roman:</span>
                        {sent.romanUrdu}
                      </p>
                    </div>
                  )}

                  {/* Vocabulary Tip */}
                  {settings.showVocabTips && sent.vocabTip && (
                    <div className="mt-3 p-2.5 rounded-xl bg-teal-950/30 border border-teal-500/20 text-xs text-teal-300 flex items-start gap-2">
                      <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-teal-400" />
                      <div>
                        <span className="font-bold text-teal-200">Key Vocab & Idiom: </span>
                        <span>{sent.vocabTip}</span>
                      </div>
                    </div>
                  )}

                  {/* Practice Speaking / Voice Compare Trigger */}
                  <div className="mt-3 flex items-center justify-between pt-2">
                    <button
                      onClick={() => setActiveRecordingSentenceId(isRecordingOpen ? null : sent.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                        isRecordingOpen
                          ? 'bg-teal-500 text-slate-950 border-teal-400'
                          : 'bg-slate-800/80 hover:bg-slate-700/80 text-teal-300 border-slate-700/80'
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>{isRecordingOpen ? 'Close Voice Compare' : 'Practice Speaking / اپنی آواز ملائیں'}</span>
                    </button>

                    {isCurrent && (
                      <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>English + Urdu Voice Active</span>
                      </span>
                    )}
                  </div>

                  {/* Embedded Voice Compare & Pronunciation Analysis Drawer */}
                  {isRecordingOpen && (
                    <VoiceCompareWidget
                      sentence={sent}
                      isNativePlaying={isCurrentlySpeakingThis && activeVoiceLanguage === 'en'}
                      isUrduPlaying={isCurrentlySpeakingThis && activeVoiceLanguage === 'ur'}
                      onPlayNative={() => playSentence(index)}
                      onPlayUrdu={() => playUrduOnly(index)}
                      onSaveScore={(scoreVal) => handleSaveScore(sent.id, scoreVal)}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Scene Navigation Footer Buttons */}
        <div className="mt-8 flex items-center justify-between gap-3 pt-6 border-t border-slate-800">
          {onPrevScene ? (
            <button
              onClick={onPrevScene}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Scene</span>
            </button>
          ) : <div />}

          <button
            onClick={markSceneCompleted}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-lg ${
              isCompleted
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>{isCompleted ? 'Completed / مکمل ہو چکا' : 'Mark as Complete / مکمل نشان لگائیں'}</span>
          </button>

          {onNextScene ? (
            <button
              onClick={onNextScene}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-md transition"
            >
              <span>Next Scene</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : <div />}
        </div>
      </main>

      {/* Persistent Bottom Audio Player Controls Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <AudioControlsBar
          isPlaying={isPlaying}
          activeLanguage={activeVoiceLanguage}
          settings={settings}
          onTogglePlay={handleTogglePlay}
          onNextSentence={handleNext}
          onPrevSentence={handlePrev}
          onUpdateSettings={onUpdateSettings}
          sentenceIndex={currentSentenceIndex}
          totalSentences={sentences.length}
        />
      </div>

      {/* Clean Structured Data (JSON) Modal */}
      <StructuredDataModal
        isOpen={isStructuredModalOpen}
        onClose={() => setIsStructuredModalOpen(false)}
        scene={scene}
      />
    </div>
  );
};

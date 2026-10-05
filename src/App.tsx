import React, { useState, useEffect } from 'react';
import { Scene, AudioSettings, UserProgress } from './types';
import { allScenes } from './data/allScenes';
import { Header } from './components/Header';
import { SceneList } from './components/SceneList';
import { ScenePlayer } from './components/ScenePlayer';
import { SettingsModal } from './components/SettingsModal';
import { ProgressStatsModal } from './components/ProgressStatsModal';
import { OfflineIndicator } from './components/OfflineIndicator';

const PROGRESS_STORAGE_KEY = 'eng_urdu_routine_progress_v1';
const SETTINGS_STORAGE_KEY = 'eng_urdu_routine_settings_v1';

const defaultSettings: AudioSettings = {
  mode: 'both', // Speaks English, then speaks Urdu voice!
  speed: 1.0,
  autoPlayNext: true,
  repeatTimes: 1,
  showUrduScript: true,
  showRomanUrdu: true,
  showVocabTips: true,
  englishVoiceName: '',
  urduVoiceName: '',
};

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

const initialProgress: UserProgress = {
  completedSceneIds: [],
  practicedSentenceIds: [],
  recordedSentenceIds: [],
  bookmarkedSentenceIds: [],
  streakDays: 1,
  lastActiveDate: getTodayString(),
  sentenceScores: {},
};

export default function App() {
  // Load progress from localStorage
  const [progress, setProgress] = useState<UserProgress>(() => {
    try {
      const saved = localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const today = getTodayString();
        // Calculate streak
        if (parsed.lastActiveDate !== today) {
          const lastDate = new Date(parsed.lastActiveDate);
          const currentDate = new Date(today);
          const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            parsed.streakDays = (parsed.streakDays || 0) + 1;
          } else if (diffDays > 1) {
            parsed.streakDays = 1;
          }
          parsed.lastActiveDate = today;
        }
        return parsed;
      }
    } catch (e) {
      console.error("Failed to load progress from localStorage:", e);
    }
    return initialProgress;
  });

  // Load settings from localStorage
  const [settings, setSettings] = useState<AudioSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        return { ...defaultSettings, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error("Failed to load settings:", e);
    }
    return defaultSettings;
  });

  const [activeScene, setActiveScene] = useState<Scene | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  // Save progress
  useEffect(() => {
    try {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.warn("Failed to save progress to localStorage:", e);
    }
  }, [progress]);

  // Save settings
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn("Failed to save settings to localStorage:", e);
    }
  }, [settings]);

  const handleUpdateSettings = (newPartial: Partial<AudioSettings>) => {
    setSettings((prev) => ({ ...prev, ...newPartial }));
  };

  const handleResetProgress = () => {
    setProgress({
      completedSceneIds: [],
      practicedSentenceIds: [],
      recordedSentenceIds: [],
      bookmarkedSentenceIds: [],
      streakDays: 1,
      lastActiveDate: getTodayString(),
      sentenceScores: {},
    });
  };

  const handleNextScene = () => {
    if (!activeScene) return;
    const currentIndex = allScenes.findIndex((s) => s.id === activeScene.id);
    if (currentIndex < allScenes.length - 1) {
      setActiveScene(allScenes[currentIndex + 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevScene = () => {
    if (!activeScene) return;
    const currentIndex = allScenes.findIndex((s) => s.id === activeScene.id);
    if (currentIndex > 0) {
      setActiveScene(allScenes[currentIndex - 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Header */}
      <Header
        progress={progress}
        totalScenes={allScenes.length}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onNavigateHome={() => setActiveScene(null)}
        activeSceneTitle={activeScene ? `Scene ${activeScene.id}: ${activeScene.title}` : undefined}
      />

      {/* Main Content Area */}
      <div className="flex-1">
        {activeScene ? (
          <ScenePlayer
            scene={activeScene}
            settings={settings}
            progress={progress}
            onBack={() => setActiveScene(null)}
            onUpdateSettings={handleUpdateSettings}
            onUpdateProgress={setProgress}
            onNextScene={
              allScenes.findIndex((s) => s.id === activeScene.id) < allScenes.length - 1
                ? handleNextScene
                : undefined
            }
            onPrevScene={
              allScenes.findIndex((s) => s.id === activeScene.id) > 0
                ? handlePrevScene
                : undefined
            }
          />
        ) : (
          <SceneList
            scenes={allScenes}
            progress={progress}
            onSelectScene={(scene) => {
              setActiveScene(scene);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenStats={() => setIsStatsOpen(true)}
          />
        )}
      </div>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onResetProgress={handleResetProgress}
      />

      <ProgressStatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        progress={progress}
        scenes={allScenes}
        onSelectScene={(scene) => {
          setActiveScene(scene);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Offline Status Badge */}
      <OfflineIndicator />
    </div>
  );
}

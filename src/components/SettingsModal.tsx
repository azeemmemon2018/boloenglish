import React, { useEffect, useState } from 'react';
import { X, Volume2, Globe, Sliders, RotateCcw, Check, Sparkles } from 'lucide-react';
import { AudioSettings, AudioPlayMode } from '../types';
import { speechService } from '../services/speechService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AudioSettings;
  onUpdateSettings: (newSettings: Partial<AudioSettings>) => void;
  onResetProgress: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetProgress,
}) => {
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (isOpen) {
      speechService.getAvailableVoices().then(setAvailableVoices);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const englishVoices = availableVoices.filter((v) => v.lang.startsWith('en'));
  const urduVoices = availableVoices.filter((v) => v.lang.startsWith('ur') || v.lang.startsWith('hi'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Audio & Language Settings</h3>
              <p className="text-xs text-slate-400 font-urdu">آواز اور زبان کی ترتیبات</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-6">
          {/* Section 1: Audio Playback Mode */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Default Voice Playback Mode / آواز کا موڈ
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => onUpdateSettings({ mode: 'both' })}
                className={`p-3 rounded-xl border text-left transition ${
                  settings.mode === 'both'
                    ? 'bg-teal-600/30 border-teal-500 text-teal-200'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>English + اردو</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                  English sentence first, then Urdu translation voice immediately
                </p>
              </button>

              <button
                onClick={() => onUpdateSettings({ mode: 'english_only' })}
                className={`p-3 rounded-xl border text-left transition ${
                  settings.mode === 'english_only'
                    ? 'bg-teal-600/30 border-teal-500 text-teal-200'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="font-bold text-xs">English Only</div>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                  Native English voice only for listening practice
                </p>
              </button>

              <button
                onClick={() => onUpdateSettings({ mode: 'urdu_only' })}
                className={`p-3 rounded-xl border text-left transition ${
                  settings.mode === 'urdu_only'
                    ? 'bg-teal-600/30 border-teal-500 text-teal-200'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="font-bold text-xs font-urdu">صرف اردو آواز</div>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug font-urdu">
                  صرف ترجمہ کی آواز سنیں
                </p>
              </button>
            </div>
          </div>

          {/* Section 2: Display Text Preferences */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Text & Translation Visibility / متن کی نمائش
            </label>
            <div className="space-y-2.5">
              {/* Show Urdu Script */}
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">Show Urdu Script / اردو رسم الخط دکھائیں</span>
                  <span className="text-[11px] text-slate-400 font-urdu">نستعلیق انداز میں اردو ترجمہ</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showUrduScript}
                  onChange={(e) => onUpdateSettings({ showUrduScript: e.target.checked })}
                  className="w-4 h-4 rounded text-teal-500 focus:ring-teal-400 bg-slate-800 border-slate-700"
                />
              </label>

              {/* Show Roman Urdu */}
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">Show Roman Urdu / رومن اردو تلفظ</span>
                  <span className="text-[11px] text-slate-400">English letters (e.g. "Main alarm band karta hoon")</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showRomanUrdu}
                  onChange={(e) => onUpdateSettings({ showRomanUrdu: e.target.checked })}
                  className="w-4 h-4 rounded text-teal-500 focus:ring-teal-400 bg-slate-800 border-slate-700"
                />
              </label>

              {/* Show Vocab tips */}
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">Show Vocabulary & Idiom Tips / الفاظ کے معانی</span>
                  <span className="text-[11px] text-slate-400">Explanations of difficult workplace idioms</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showVocabTips}
                  onChange={(e) => onUpdateSettings({ showVocabTips: e.target.checked })}
                  className="w-4 h-4 rounded text-teal-500 focus:ring-teal-400 bg-slate-800 border-slate-700"
                />
              </label>
            </div>
          </div>

          {/* Section 3: Speech Synthesis Voices */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Speech Synthesis Voices (Offline Browser Engine)
            </label>
            
            <div className="space-y-3">
              {/* English Voice Selector */}
              <div>
                <span className="text-xs text-slate-400 block mb-1">English Voice:</span>
                <select
                  value={settings.englishVoiceName}
                  onChange={(e) => onUpdateSettings({ englishVoiceName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="">Default Recommended English Voice</option>
                  {englishVoices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>

              {/* Urdu Voice Selector */}
              <div>
                <span className="text-xs text-slate-400 block mb-1">Urdu / Hindustani Voice:</span>
                <select
                  value={settings.urduVoiceName}
                  onChange={(e) => onUpdateSettings({ urduVoiceName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="">Default Auto-detected Urdu Voice</option>
                  {urduVoices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Data Reset */}
          <div className="pt-4 border-t border-slate-800">
            {confirmReset ? (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30">
                <p className="text-xs text-rose-300 mb-2 font-medium">
                  Are you sure you want to reset all completed scenes and recorded scores?
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onResetProgress();
                      setConfirmReset(false);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                  >
                    Yes, Reset Everything
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmReset(true)}
                className="flex items-center gap-2 text-xs text-slate-400 hover:text-rose-400 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Practice Progress & History</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md transition"
          >
            Done / محفوظ کریں
          </button>
        </div>
      </div>
    </div>
  );
};

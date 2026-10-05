import React, { useState } from 'react';
import { X, Copy, Check, Code2, Download, Volume2, Sparkles } from 'lucide-react';
import { Scene } from '../types';
import { speechService } from '../services/speechService';

interface StructuredDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  scene: Scene;
}

export const StructuredDataModal: React.FC<StructuredDataModalProps> = ({
  isOpen,
  onClose,
  scene,
}) => {
  const [copied, setCopied] = useState(false);
  const [testPlayingIndex, setTestPlayingIndex] = useState<number | null>(null);
  const [testEngine, setTestEngine] = useState<'en-US' | 'ur-PK' | null>(null);

  if (!isOpen) return null;

  // Clean structured format separating en-US and ur-PK variables
  const structuredData = {
    scene_id: scene.id,
    scene_title_en: scene.title,
    scene_title_ur: scene.titleUrdu,
    category_en: scene.category,
    category_ur: scene.categoryUrdu,
    language_specifications: {
      english_locale: "en-US",
      urdu_locale: "ur-PK",
      boundary_separation: "Strictly isolated text fields for dedicated voice engines"
    },
    dialogues: scene.sentences.map((sent, index) => ({
      index: index + 1,
      id: sent.id,
      speaker: sent.speaker,
      speaker_ur: sent.speakerUrdu,
      english: {
        locale: "en-US",
        text: sent.english,
        voice_target: "en-US Standard English Voice"
      },
      urdu: {
        locale: "ur-PK",
        text: sent.urdu,
        roman_transliteration: sent.romanUrdu,
        voice_target: "ur-PK Native Pakistani Urdu Voice"
      },
      learning_notes: {
        vocabulary: sent.vocabTip || ""
      }
    }))
  };

  const jsonString = JSON.stringify(structuredData, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scene_${scene.id}_bilingual_en_US_ur_PK.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const testVoice = async (index: number, engine: 'en-US' | 'ur-PK') => {
    const target = scene.sentences[index];
    if (!target) return;

    setTestPlayingIndex(index);
    setTestEngine(engine);

    try {
      if (engine === 'en-US') {
        await speechService.playSentenceBilingual({
          englishText: target.english,
          urduText: target.urdu,
          romanUrduText: target.romanUrdu,
          mode: 'english_only',
          onFinish: () => {
            setTestPlayingIndex(null);
            setTestEngine(null);
          },
          onError: () => {
            setTestPlayingIndex(null);
            setTestEngine(null);
          }
        });
      } else {
        await speechService.playSentenceBilingual({
          englishText: target.english,
          urduText: target.urdu,
          romanUrduText: target.romanUrdu,
          mode: 'urdu_only',
          onFinish: () => {
            setTestPlayingIndex(null);
            setTestEngine(null);
          },
          onError: () => {
            setTestPlayingIndex(null);
            setTestEngine(null);
          }
        });
      }
    } catch {
      setTestPlayingIndex(null);
      setTestEngine(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Structured Voice Learning Content (JSON)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40">
                  en-US + ur-PK
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Absolute language separation for native English & native Pakistani Urdu voice engines
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="py-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Scene {scene.id}:</span>
            <span className="font-semibold text-teal-300">{scene.title}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied JSON!' : 'Copy JSON'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON</span>
            </button>
          </div>
        </div>

        {/* Interactive Voice Engine Test Bar */}
        <div className="py-2.5 px-3 my-2 rounded-xl bg-slate-950 border border-slate-800 text-xs flex flex-wrap items-center justify-between gap-2">
          <span className="text-slate-400 font-medium">
            Test Engine Isolation (Sentence 1):
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => testVoice(0, 'en-US')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition ${
                testPlayingIndex === 0 && testEngine === 'en-US'
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                  : 'bg-slate-900 hover:bg-slate-800 text-cyan-300 border-cyan-500/30'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Test 'en-US' Audio</span>
            </button>

            <button
              onClick={() => testVoice(0, 'ur-PK')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold font-urdu transition ${
                testPlayingIndex === 0 && testEngine === 'ur-PK'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-slate-900 hover:bg-slate-800 text-emerald-300 border-emerald-500/30'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>'ur-PK' آواز ٹیسٹ</span>
            </button>
          </div>
        </div>

        {/* Code Viewer */}
        <div className="flex-1 overflow-y-auto rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-300">
          <pre className="whitespace-pre-wrap leading-relaxed">
            {jsonString}
          </pre>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Strict locale segregation: en-US (standard English) & ur-PK (native Pakistani Urdu)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

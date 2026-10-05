import React, { useState } from 'react';
import { 
  Mic, MicOff, Play, Pause, RotateCcw, CheckCircle2, 
  Volume2, Sparkles, Award, AlertCircle 
} from 'lucide-react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { PracticeSentence, SentenceRecordData } from '../types';
import confetti from 'canvas-confetti';

interface VoiceCompareWidgetProps {
  sentence: PracticeSentence;
  onPlayNative: () => void;
  isNativePlaying: boolean;
  onPlayUrdu?: () => void;
  isUrduPlaying?: boolean;
  onSaveScore?: (score: number) => void;
}

export const VoiceCompareWidget: React.FC<VoiceCompareWidgetProps> = ({
  sentence,
  onPlayNative,
  isNativePlaying,
  onPlayUrdu,
  isUrduPlaying,
  onSaveScore,
}) => {
  const [lastScore, setLastScore] = useState<number | null>(null);

  const {
    isRecording,
    recordingDuration,
    audioUrl,
    isPlayingRecorded,
    recordedData,
    transcript,
    errorMessage,
    startRecording,
    stopRecording,
    playRecordedAudio,
    stopRecordedAudio,
  } = useAudioRecorder({
    targetSentence: sentence.english,
    onRecordingComplete: (data: SentenceRecordData) => {
      setLastScore(data.score);
      onSaveScore?.(data.score);
      if (data.score >= 80) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
        });
      }
    },
  });

  return (
    <div className="mt-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-lg">
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <span>Voice Comparison & Pronunciation</span>
              <span className="font-urdu text-[11px] text-teal-400">آواز کا موازنہ</span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Record yourself speaking English and compare directly with the native model.
            </p>
          </div>
        </div>

        {/* Score pill if recorded */}
        {recordedData && (
          <div className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
            recordedData.score >= 80
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : recordedData.score >= 60
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
          }`}>
            <Award className="w-3.5 h-3.5" />
            <span>{recordedData.score}% Match</span>
          </div>
        )}
      </div>

      {/* Error alert if mic was blocked */}
      {errorMessage && (
        <div className="mt-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Center Action: Record button & Active timer */}
      <div className="mt-4 flex flex-col items-center justify-center">
        {isRecording ? (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={stopRecording}
              className="relative group flex items-center justify-center w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition transform hover:scale-105 active:scale-95 animate-pulse"
              title="Click to stop recording"
            >
              <MicOff className="w-7 h-7" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
              </span>
            </button>
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>Recording... ({recordingDuration}s) — Click when finished</span>
            </div>
            {transcript && (
              <p className="mt-1 text-xs text-slate-300 italic max-w-md text-center bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
                "{transcript}"
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={startRecording}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-md shadow-teal-900/30 transition active:scale-95 group"
            >
              <Mic className="w-4 h-4 group-hover:scale-110 transition" />
              <span>{audioUrl ? "Record Again / دوبارہ بولیں" : "Record Your Voice / اپنی آواز ریکارڈ کریں"}</span>
            </button>
            <span className="text-[11px] text-slate-400">
              Tap mic and read the English sentence aloud clearly
            </span>
          </div>
        )}
      </div>

      {/* Side-by-Side Audio Comparison Player (when audio is recorded) */}
      {audioUrl && !isRecording && (
        <div className="mt-4 pt-4 border-t border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Native Model Audio button */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5" />
                  Native English Model
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  en-US Pronunciation
                </span>
              </div>
              <button
                onClick={onPlayNative}
                className="mt-2.5 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-medium transition active:scale-95"
              >
                {isNativePlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-cyan-300" />
                    <span>Listen English</span>
                  </>
                )}
              </button>
            </div>

            {/* Pakistani Urdu Voice Model button */}
            {onPlayUrdu && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5" />
                    Pakistani Urdu Voice
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5 font-urdu">
                    پاکستانی اردو آواز
                  </span>
                </div>
                <button
                  onClick={onPlayUrdu}
                  className="mt-2.5 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium font-urdu transition active:scale-95"
                >
                  {isUrduPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>روکیں</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-emerald-300" />
                      <span>اردو سنیں</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* My Voice Audio button */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-teal-300 flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5" />
                  My Voice Recording
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5 font-urdu">
                  میری ریکارڈنگ
                </span>
              </div>
              <button
                onClick={isPlayingRecorded ? stopRecordedAudio : playRecordedAudio}
                className="mt-2.5 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/30 text-xs font-medium transition active:scale-95"
              >
                {isPlayingRecorded ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-teal-300" />
                    <span>Play My Voice</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Word match breakdown */}
          {recordedData && recordedData.wordMatches.length > 0 && (
            <div className="mt-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                Pronunciation Analysis / تلفظ کا تجزیہ:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {recordedData.wordMatches.map((item, idx) => (
                  <span
                    key={idx}
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      item.matched
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 line-through'
                    }`}
                  >
                    {item.word}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-slate-400 leading-relaxed font-urdu">
                {recordedData.score >= 80
                  ? 'شاندار تلفظ! آپ کے بولنے کی روانی اور الفاظ کا انداز مقامی بولنے والوں سے بہت ملتا جلتا ہے۔'
                  : 'اچھی کوشش! ماڈل آڈیو سن کر دوبارہ کوشش کریں اور نمایاں کیے گئے الفاظ کو واضح بولیں۔'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

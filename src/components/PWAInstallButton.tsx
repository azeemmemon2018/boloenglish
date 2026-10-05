import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed as standalone PWA
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 px-3 py-1.5 text-xs font-medium transition shadow-sm active:scale-95"
        title="Install app for offline practice"
      >
        <Download className="w-3.5 h-3.5 text-teal-400" />
        <span className="hidden sm:inline">Install Offline App</span>
        <span className="sm:hidden">Install</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 px-2.5 py-1.5 text-xs font-medium transition"
        >
          <Smartphone className="w-3.5 h-3.5 text-teal-400" />
          <span>iOS Install</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-teal-400 flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Install on iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-slate-300">
                1. سفاری کے نیچے دیے گئے <strong className="text-white">Share (شیئر)</strong> بٹن کو دبائیں۔<br /><br />
                2. فہرست میں نیچے سکرول کریں اور <strong className="text-teal-400">Add to Home Screen (ہوم اسکرین پر شامل کریں)</strong> منتخب کریں۔<br /><br />
                3. اب یہ ایپ انٹرنیٹ کے بغیر بھی آپ کی ہوم اسکرین سے فوری کھلے گی!
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-xl bg-teal-600 hover:bg-teal-500 py-2.5 text-sm font-semibold text-white transition"
              >
                سمجھ گیا / Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

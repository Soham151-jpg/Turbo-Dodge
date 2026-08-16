import React, { useState } from 'react';
import { Smartphone, Download, X, CheckCircle2, Share2, MoreVertical } from 'lucide-react';

export const PwaInstallBanner: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="w-full max-w-[480px] mx-auto mt-4 px-2 font-sans text-xs">
      {!isOpen ? (
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-white">Install on Android Phone</p>
              <p className="text-neutral-400 text-[11px]">Play fullscreen like a native app</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <a
              href="/turbo_dodge.html"
              download="turbo_dodge.html"
              className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-neutral-950 font-bold rounded-lg transition text-[11px] flex items-center gap-1"
              title="Download standalone single HTML file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .HTML</span>
            </a>
            <button
              onClick={() => setIsOpen(true)}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-neutral-950 font-bold rounded-lg transition text-[11px] flex items-center gap-1"
            >
              <span>Guide</span>
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 text-neutral-500 hover:text-neutral-300 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-neutral-900 border border-emerald-500/30 rounded-2xl p-4 shadow-2xl relative space-y-3">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-3 right-3 text-neutral-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>How to install Turbo Dodge on Android:</span>
          </div>

          <ol className="space-y-2 text-neutral-300 text-[12px] list-decimal pl-4">
            <li>
              Open this app link in <strong>Google Chrome</strong> on your phone.
            </li>
            <li className="flex items-center gap-1 flex-wrap">
              Tap Chrome&apos;s <strong>3 dots menu</strong> <MoreVertical className="w-3.5 h-3.5 inline text-neutral-400" /> or <strong>Share icon</strong> <Share2 className="w-3.5 h-3.5 inline text-neutral-400" /> at the top right.
            </li>
            <li>
              Select <strong>&quot;Add to Home screen&quot;</strong> or <strong>&quot;Install app&quot;</strong>.
            </li>
            <li>
              The Turbo Dodge app icon will now appear on your phone home screen!
            </li>
          </ol>

          <button
            onClick={() => setIsOpen(false)}
            className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold rounded-lg text-center"
          >
            Got it, thanks!
          </button>
        </div>
      )}
    </div>
  );
};

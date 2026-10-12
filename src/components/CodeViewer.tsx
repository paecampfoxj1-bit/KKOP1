import React, { useState } from 'react';
import { Copy, Download, Check, FileCode, ExternalLink } from 'lucide-react';
import { STANDALONE_INDEX_HTML, STANDALONE_APP_JS } from '../data/standaloneCode';

export const CodeViewer: React.FC = () => {
  const [activeFile, setActiveFile] = useState<'index.html' | 'app.js'>('index.html');
  const [copied, setCopied] = useState(false);

  const currentContent = activeFile === 'index.html' ? STANDALONE_INDEX_HTML : STANDALONE_APP_JS;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    const blob = new Blob([currentContent], {
      type: activeFile === 'index.html' ? 'text/html' : 'text/javascript',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    // Download index.html
    const blobHtml = new Blob([STANDALONE_INDEX_HTML], { type: 'text/html' });
    const urlHtml = URL.createObjectURL(blobHtml);
    const aHtml = document.createElement('a');
    aHtml.href = urlHtml;
    aHtml.download = 'index.html';
    document.body.appendChild(aHtml);
    aHtml.click();
    document.body.removeChild(aHtml);
    URL.revokeObjectURL(urlHtml);

    // Download app.js after short delay
    setTimeout(() => {
      const blobJs = new Blob([STANDALONE_APP_JS], { type: 'text/javascript' });
      const urlJs = URL.createObjectURL(blobJs);
      const aJs = document.createElement('a');
      aJs.href = urlJs;
      aJs.download = 'app.js';
      document.body.appendChild(aJs);
      aJs.click();
      document.body.removeChild(aJs);
      URL.revokeObjectURL(urlJs);
    }, 400);
  };

  return (
    <div className="space-y-4">
      {/* Intro Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileCode className="w-5 h-5 text-amber-400" />
              <span>ซอร์สโค้ดสำเร็จรูป 2 ไฟล์หลัก (index.html + app.js)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              โค้ดชุดนี้ถูกจัดเตรียมตามสเปก ใช้ Tailwind CSS ผ่าน CDN + Firebase Realtime Database SDK
              พร้อมใช้งานทันทีโดยไม่ต้องติดตั้ง Node.js หรือ Bundle Tools
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadAll}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลดทั้ง 2 ไฟล์ (.zip / ทั้งหมด)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Code Viewer Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
        {/* File Tabs & Actions Toolbar */}
        <div className="bg-slate-950 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveFile('index.html')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors flex items-center gap-1.5 ${
                activeFile === 'index.html'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-orange-400" />
              <span>1. index.html</span>
              <span className="text-[10px] text-slate-400">(UI หน้าเว็บ + Tailwind CDN)</span>
            </button>

            <button
              onClick={() => setActiveFile('app.js')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors flex items-center gap-1.5 ${
                activeFile === 'app.js'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
              <span>2. app.js</span>
              <span className="text-[10px] text-slate-400">(Firebase KKop & Auto-Reset พุธ 05:00)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
              <span>{copied ? 'คัดลอกสำเร็จแล้ว!' : 'คัดลอกโค้ดไฟล์นี้'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>ดาวน์โหลด {activeFile}</span>
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="relative">
          <pre className="p-4 sm:p-5 text-[11px] sm:text-xs font-mono text-slate-200 overflow-x-auto max-h-[600px] leading-relaxed bg-[#0a0f1d] selection:bg-amber-500 selection:text-slate-950">
            <code>{currentContent}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};

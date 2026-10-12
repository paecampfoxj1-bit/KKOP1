import React, { useState } from 'react';
import { X, Database, Check, ShieldCheck, Copy, Sparkles, RefreshCw } from 'lucide-react';
import { FirebaseConnectionConfig } from '../types';
import firebaseConfigData from '../../firebase-applet-config.json';

interface FirebaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: FirebaseConnectionConfig | null;
  onSave: (config: FirebaseConnectionConfig) => void;
  onResetDemoData: () => void;
}

export const FirebaseModal: React.FC<FirebaseModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
  onResetDemoData,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(JSON.stringify(firebaseConfigData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0e1424] border border-slate-800 rounded-2xl w-full max-w-lg p-5 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>การเชื่อมต่อ Firebase Firestore</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ออนไลน์
                </span>
              </h3>
              <p className="text-xs text-slate-400">ทุกคนเข้าได้เลยไม่ต้องขออนุญาต &bull; ซิงค์ข้อมูลเรียลไทม์</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs">
          {/* Active Connection Banner */}
          <div className="p-3.5 bg-gradient-to-r from-emerald-950/30 via-emerald-950/20 to-indigo-950/30 border border-emerald-500/30 rounded-xl text-emerald-200 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>เชื่อมต่อฐานข้อมูล Firebase สำเร็จเรียบร้อยแล้ว</span>
            </div>
            <p className="text-[11px] text-emerald-200/80 leading-relaxed">
              ระบบเชื่อมต่อกับ <strong>Google Cloud Firestore</strong> ให้คุณเรียบร้อยแล้ว ทุกการตีเรด, การเปลี่ยนรูปกิลด์ผ่าน <kbd className="px-1 py-0.5 bg-black/40 rounded text-emerald-300 font-mono">Ctrl+V</kbd>, และการรีเซ็ตประจำสัปดาห์จะซิงค์หากันแบบเรียลไทม์ทันที โดยที่ทุกคนไม่ต้องลงชื่อเข้าใช้หรือขอสิทธิ์ใดๆ
            </p>
          </div>

          {/* Config Details */}
          <div className="bg-[#080d1a] border border-slate-800 rounded-xl p-3.5 space-y-2 font-mono text-[11px]">
            <div className="flex justify-between items-center text-slate-400">
              <span>Firebase Project ID:</span>
              <span className="text-indigo-300 font-semibold">{firebaseConfigData.projectId}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Firestore Database:</span>
              <span className="text-indigo-300 truncate max-w-[240px] text-right font-semibold">
                {firebaseConfigData.firestoreDatabaseId}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Security Rules:</span>
              <span className="text-emerald-400 font-semibold">เปิดสิทธิ์อ่าน/เขียนสำหรับสมาชิกกิลด์</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>สิทธิ์การเข้าใช้งาน:</span>
              <span className="text-emerald-300 font-semibold">เข้าได้ทันที ไม่ต้องขออนุญาต (Zero Friction)</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2">
            <button
              onClick={handleCopyConfig}
              className="px-3 py-2 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/40 text-indigo-300 rounded-xl font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'คัดลอก Config แล้ว' : 'คัดลอก Config JSON'}</span>
            </button>

            <button
              onClick={() => {
                if (confirm('ต้องการคืนค่ากิลด์เริ่มต้นตามหน้าจอต้นฉบับหรือไม่?')) {
                  onResetDemoData();
                  onClose();
                }
              }}
              className="px-3 py-2 bg-rose-950/40 hover:bg-rose-900/40 border border-rose-500/30 text-rose-300 rounded-xl font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>รีเซ็ตข้อมูลตัวอย่าง 4 กิลด์</span>
            </button>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer shadow-md"
          >
            ตกลง
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Database, Info, RotateCcw } from 'lucide-react';
import { FirebaseConnectionConfig } from '../types';

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
  const [databaseURL, setDatabaseURL] = useState(
    config?.databaseURL || 'https://kkop-default-rtdb.asia-southeast1.firebasedatabase.app'
  );
  const [apiKey, setApiKey] = useState(config?.apiKey || '');
  const [projectId, setProjectId] = useState(config?.projectId || 'kkop-guild');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!databaseURL.trim()) {
      alert('กรุณากรอก Realtime Database URL');
      return;
    }

    onSave({
      databaseURL: databaseURL.trim(),
      apiKey: apiKey.trim(),
      projectId: projectId.trim() || 'kkop-guild',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-500" />
            <span>ตั้งค่าเชื่อมต่อ Firebase Realtime Database</span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <p className="text-slate-400">
            ระบุ URL ฐานข้อมูลของโปรเจกต์ <strong>KKop</strong> เพื่อให้ทุกเครื่องที่เปิดเว็บเห็นข้อมูลตรงกันแบบเรียลไทม์ทันที:
          </p>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Database URL <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              value={databaseURL}
              onChange={e => setDatabaseURL(e.target.value)}
              placeholder="https://kkop-default-rtdb.asia-southeast1.firebasedatabase.app"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Web API Key (ถ้ามี)</label>
            <input
              type="text"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Project ID</label>
            <input
              type="text"
              value={projectId}
              onChange={e => setProjectId(e.target.value)}
              placeholder="kkop-guild"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-xs font-mono"
            />
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-300/90 text-[11px] leading-relaxed flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <strong>คำแนะนำ:</strong> ในหน้า Firebase Console &gt; Realtime Database &gt; Rules ให้ตั้งค่า{' '}
              <code className="bg-slate-950 px-1 py-0.5 rounded text-amber-200 font-mono text-[10px]">
                {'{ ".read": true, ".write": true }'}
              </code>{' '}
              เพื่อให้สมาชิกในกิลด์ทุกคนสามารถเช็คชื่อและกดรอบตีร่วมกันได้โดยไม่ต้องล็อกอิน
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-3">
            <button
              type="button"
              onClick={() => {
                if (confirm('ต้องการโหลดข้อมูลตัวอย่างเริ่มต้นของกิลด์ KKop หรือไม่?')) {
                  onResetDemoData();
                  onClose();
                }
              }}
              className="px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>รีเซ็ตข้อมูลตัวอย่าง</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
              >
                ปิด
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-lg text-xs transition-colors shadow-md"
              >
                บันทึกและเชื่อมต่อ
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

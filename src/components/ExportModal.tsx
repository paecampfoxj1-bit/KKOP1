import React, { useState } from 'react';
import { X, Copy, Check, Share2 } from 'lucide-react';
import { GuildMember, WeeklyCycleInfo } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: GuildMember[];
  cycleInfo: WeeklyCycleInfo;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  members,
  cycleInfo,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const total = members.length;
  const checkedIn = members.filter(m => m.checkedIn).length;
  const completed = members.filter(m => (m.hits || 0) >= 3);
  const partial = members.filter(m => (m.hits || 0) > 0 && (m.hits || 0) < 3);
  const zero = members.filter(m => (m.hits || 0) === 0);
  const totalDamage = members.reduce((sum, m) => sum + (Number(m.damage) || 0), 0);

  let text = `🛡️ [สรุปสถานะเรดแคลน กิลด์รอง KKop]\n`;
  text += `📅 ${cycleInfo.dateLabel}\n`;
  text += `------------------------------------\n`;
  text += `👥 สมาชิกทั้งหมด: ${total} คน | เช็คชื่อแล้ว: ${checkedIn}/${total}\n`;
  text += `⚔️ ตีครบ 3/3: ${completed.length} คน | กำลังตี: ${partial.length} คน | ยังไม่ตี: ${zero.length} คน\n`;
  text += `💥 ดาเมจรวมกิลด์: ${totalDamage.toFixed(1)} M\n`;
  text += `------------------------------------\n\n`;

  if (zero.length > 0) {
    text += `⚠️ สมาชิกที่ยังไม่ได้ลงเรด (0/3):\n`;
    zero.forEach((m, idx) => {
      text += ` ${idx + 1}. ${m.name} (${m.role}) - ${m.checkedIn ? 'เช็คชื่อแล้ว' : 'ยังไม่เช็ค'}${
        m.note ? ' [' + m.note + ']' : ''
      }\n`;
    });
    text += `\n`;
  }

  if (partial.length > 0) {
    text += `⏳ สมาชิกที่กำลังตี (${partial.length} คน):\n`;
    partial.forEach((m, idx) => {
      text += ` ${idx + 1}. ${m.name} (${m.hits}/3 รอบ) - ${m.damage || 0}M${
        m.note ? ' [' + m.note + ']' : ''
      }\n`;
    });
    text += `\n`;
  }

  if (completed.length > 0) {
    text += `✅ ตีครบ 3/3 แล้ว (${completed.length} คน):\n`;
    completed.forEach((m) => {
      text += ` • ${m.name}: ${m.damage || 0}M\n`;
    });
  }

  text += `\n⏰ รีเซ็ตรอบถัดไป: วันพุธ เวลา 05:00 น. (UTC+7)`;

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Share2 className="w-4 h-4 text-emerald-400" />
            <span>สรุปสถานะส่ง LINE / Discord</span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <p className="text-xs text-slate-400">
            สามารถคัดลอกข้อความสรุปด้านล่างไปแจ้งเตือนในกลุ่มกิลด์ LINE หรือเซิร์ฟเวอร์ Discord ได้ทันที:
          </p>
          <textarea
            readOnly
            rows={11}
            value={text}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500 resize-none selection:bg-amber-500 selection:text-slate-950"
          />
        </div>

        <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-800 pt-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
          >
            ปิด
          </button>
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-md"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-slate-950" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'คัดลอกสำเร็จแล้ว!' : 'คัดลอกข้อความ'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

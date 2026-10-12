import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Pencil, Image as ImageIcon, Check, Trash2, Upload } from 'lucide-react';
import { GuildRaidItem, GuildIconType, DropType, RaidStatus } from '../types';
import { GuildAvatar } from './GuildAvatar';
import { processImageFile } from '../utils/image';

interface AddGuildModalProps {
  isOpen: boolean;
  onClose: () => void;
  guildToEdit: GuildRaidItem | null;
  onSave: (guildData: Omit<GuildRaidItem, 'id' | 'updatedAt'> & { id?: string }) => void;
}

const AVAILABLE_ICONS: GuildIconType[] = [
  'dragon',
  'lion',
  'crows',
  'devil',
  'phoenix',
  'wolf',
  'skull',
  'knight',
];

export const AddGuildModal: React.FC<AddGuildModalProps> = ({
  isOpen,
  onClose,
  guildToEdit,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [level, setLevel] = useState<number | string>('12');
  const [isNoLevel, setIsNoLevel] = useState(false);
  const [status, setStatus] = useState<RaidStatus>('unbeaten');
  const [dropType, setDropType] = useState<DropType>('inventory');
  const [dropNote, setDropNote] = useState('');
  const [avatarIcon, setAvatarIcon] = useState<GuildIconType>('dragon');
  const [customImage, setCustomImage] = useState<string>('');
  const [note, setNote] = useState('');
  const [pasteSuccess, setPasteSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (guildToEdit) {
      setName(guildToEdit.name);
      if (guildToEdit.level === null) {
        setIsNoLevel(true);
        setLevel('');
      } else {
        setIsNoLevel(false);
        setLevel(guildToEdit.level);
      }
      setStatus(guildToEdit.status);
      setDropType(guildToEdit.dropType);
      setDropNote(guildToEdit.dropNote || '');
      setAvatarIcon(guildToEdit.avatarIcon || 'dragon');
      setCustomImage(guildToEdit.customImage || '');
      setNote(guildToEdit.note || '');
    } else {
      setName('');
      setLevel('12');
      setIsNoLevel(false);
      setStatus('unbeaten');
      setDropType('inventory');
      setDropNote('');
      setAvatarIcon('dragon');
      setCustomImage('');
      setNote('');
    }
    setPasteSuccess(false);
  }, [guildToEdit, isOpen]);

  // Global paste handler when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            try {
              const base64 = await processImageFile(file);
              setCustomImage(base64);
              setPasteSuccess(true);
              setTimeout(() => setPasteSuccess(false), 2500);
            } catch (err) {
              console.error('Error processing pasted image:', err);
            }
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await processImageFile(file);
        setCustomImage(base64);
        setPasteSuccess(true);
        setTimeout(() => setPasteSuccess(false), 2500);
      } catch (err) {
        console.error('Error uploading image:', err);
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: guildToEdit?.id,
      name: name.trim().toUpperCase(),
      level: isNoLevel ? null : Number(level) || 1,
      status,
      dropType,
      dropNote: dropType === 'other' ? dropNote.trim() || 'คนอื่นตี' : undefined,
      avatarIcon,
      customImage: customImage || undefined,
      note: note.trim() || undefined,
      beatenAt: status === 'beaten' ? (guildToEdit?.beatenAt || Date.now()) : null,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0e1424] border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            {guildToEdit ? (
              <>
                <Pencil className="w-4 h-4 text-indigo-400" />
                <span>แก้ไขข้อมูลกิลด์</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 text-indigo-400" />
                <span>เพิ่มกิลด์ใหม่</span>
              </>
            )}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          {/* Avatar Icon & Ctrl+V Paste Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-300 font-medium">
                เลือกสัญลักษณ์กิลด์ (Emblem)
              </label>
              {pasteSuccess && (
                <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 animate-pulse">
                  <Check className="w-3 h-3" /> วางรูปภาพสำเร็จ!
                </span>
              )}
            </div>

            {/* Custom Image Preview & Paste Box */}
            <div className="mb-2 p-2.5 rounded-xl border border-dashed border-indigo-500/40 bg-[#070b14] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {customImage ? (
                  <div className="w-11 h-11 rounded-xl bg-slate-900 border border-indigo-500/50 p-0.5 shadow-md relative overflow-hidden shrink-0">
                    <img src={customImage} alt="Custom" className="w-full h-full object-cover rounded-[10px]" />
                  </div>
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                    <ImageIcon className="w-5 h-5 text-indigo-400" />
                  </div>
                )}
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <span>{customImage ? 'ใช้รูปภาพที่วางเอง' : 'เปลี่ยนรูป: กด Ctrl+V ได้ทันที'}</span>
                    {customImage && (
                      <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded-full">
                        กำลังใช้งาน
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {customImage
                      ? 'กด Ctrl+V อีกครั้งเพื่อเปลี่ยนรูปใหม่'
                      : 'คัดลอกรูปภาพแล้วกด Ctrl+V หรือคลิกปุ่มด้านขวา'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {customImage ? (
                  <button
                    type="button"
                    onClick={() => setCustomImage('')}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="ลบรูปภาพนี้ แล้วกลับไปใช้สัญลักษณ์เริ่มต้น"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1.5 bg-[#0e1628] hover:bg-slate-800 text-indigo-300 border border-indigo-500/30 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                    <span>เลือกไฟล์</span>
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-4 gap-2">
              {AVAILABLE_ICONS.map(ic => {
                const isSelected = !customImage && avatarIcon === ic;
                return (
                  <button
                    type="button"
                    key={ic}
                    onClick={() => {
                      setAvatarIcon(ic);
                      setCustomImage(''); // Switch to preset icon
                    }}
                    className={`p-2 rounded-xl flex items-center justify-center transition-all cursor-pointer border ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/50 scale-105 shadow-md shadow-indigo-950/40'
                        : 'border-slate-800 bg-[#0a0f1d] hover:border-slate-700'
                    }`}
                  >
                    <GuildAvatar icon={ic} className="w-9 h-9" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              ชื่อกิลด์ / ชื่อบอส <span className="text-indigo-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="เช่น SOLOLEVELING, THAILAND, Crows"
              className="w-full bg-[#070b14] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs font-chakra tracking-wide uppercase"
            />
          </div>

          {/* Level */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-300 font-medium">เลเวลของกิลด์ (Level)</label>
              <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNoLevel}
                  onChange={e => setIsNoLevel(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-indigo-500"
                />
                <span>ไม่ระบุเลเวล</span>
              </label>
            </div>
            {!isNoLevel && (
              <input
                type="number"
                min="1"
                max="100"
                value={level}
                onChange={e => setLevel(e.target.value)}
                placeholder="เช่น 12"
                className="w-full bg-[#070b14] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs font-mono"
              />
            )}
          </div>

          {/* Drop Type */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">ประเภทของดรอป</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDropType('inventory')}
                className={`py-2 px-2 rounded-lg border text-center transition-all cursor-pointer ${
                  dropType === 'inventory'
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60 font-semibold'
                    : 'bg-[#070b14] text-slate-400 border-slate-800'
                }`}
              >
                👛 ของเข้าตัว
              </button>
              <button
                type="button"
                onClick={() => setDropType('guild')}
                className={`py-2 px-2 rounded-lg border text-center transition-all cursor-pointer ${
                  dropType === 'guild'
                    ? 'bg-blue-950/80 text-blue-300 border-blue-500/60 font-semibold'
                    : 'bg-[#070b14] text-slate-400 border-slate-800'
                }`}
              >
                🏰 เข้ากิล
              </button>
              <button
                type="button"
                onClick={() => setDropType('other')}
                className={`py-2 px-2 rounded-lg border text-center transition-all cursor-pointer ${
                  dropType === 'other'
                    ? 'bg-amber-950/80 text-amber-300 border-amber-500/60 font-semibold'
                    : 'bg-[#070b14] text-slate-400 border-slate-800'
                }`}
              >
                ❓ อื่นๆ
              </button>
            </div>

            {dropType === 'other' && (
              <div className="mt-2">
                <input
                  type="text"
                  value={dropNote}
                  onChange={e => setDropNote(e.target.value)}
                  placeholder="ระบุข้อความ เช่น คนอื่นตี, ของบอสพิเศษ"
                  className="w-full bg-[#070b14] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">สถานะปัจจุบัน</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus('unbeaten')}
                className={`py-2 px-3 rounded-lg border text-center transition-all cursor-pointer ${
                  status === 'unbeaten'
                    ? 'bg-slate-800 text-white border-slate-600 font-semibold'
                    : 'bg-[#070b14] text-slate-400 border-slate-800'
                }`}
              >
                ○ ยังไม่ได้ตี
              </button>
              <button
                type="button"
                onClick={() => setStatus('beaten')}
                className={`py-2 px-3 rounded-lg border text-center transition-all cursor-pointer ${
                  status === 'beaten'
                    ? 'bg-[#059669] text-white border-emerald-500 font-semibold'
                    : 'bg-[#070b14] text-slate-400 border-slate-800'
                }`}
              >
                ✓ ตีแล้วเรียบร้อย
              </button>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">หมายเหตุเพิ่มเติม</label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="เช่น ตีหลังเที่ยงคืน, รอกัปตันเปิด"
              className="w-full bg-[#070b14] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-lg shadow-md transition-colors cursor-pointer"
            >
              บันทึกข้อมูล
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

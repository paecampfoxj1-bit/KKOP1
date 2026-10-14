import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Pencil,
  Image as ImageIcon,
  Check,
  Trash2,
  Upload,
  Sparkles,
  Loader2,
  Info,
  CheckCircle2,
  Crop,
  Layers,
} from 'lucide-react';
import { GuildRaidItem, GuildIconType, DropType, RaidStatus } from '../types';
import { GuildAvatar } from './GuildAvatar';
import { processImageFile, cropImageRegion } from '../utils/image';

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
  const [originalFullImage, setOriginalFullImage] = useState<string>('');
  const [croppedEmblemImage, setCroppedEmblemImage] = useState<string>('');
  const [useCroppedEmblem, setUseCroppedEmblem] = useState<boolean>(true);
  const [note, setNote] = useState('');
  const [pasteSuccess, setPasteSuccess] = useState(false);
  const [isAiScanning, setIsAiScanning] = useState(false);
  const [aiExtractedInfo, setAiExtractedInfo] = useState<{
    guildName?: string;
    guildLevel?: number | null;
    hasCroppedEmblem?: boolean;
  } | null>(null);

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
      setOriginalFullImage(guildToEdit.customImage || '');
      setCroppedEmblemImage(guildToEdit.customImage || '');
      setNote(guildToEdit.note || '');

      // If opened with an image for a new guild, automatically run AI scanner
      if (!guildToEdit.name && guildToEdit.customImage) {
        handleProcessAndScanImage(guildToEdit.customImage);
      }
    } else {
      setName('');
      setLevel('12');
      setIsNoLevel(false);
      setStatus('unbeaten');
      setDropType('inventory');
      setDropNote('');
      setAvatarIcon('dragon');
      setCustomImage('');
      setOriginalFullImage('');
      setCroppedEmblemImage('');
      setNote('');
    }
    setPasteSuccess(false);
    setAiExtractedInfo(null);
  }, [guildToEdit, isOpen]);

  // AI Scanner: parse screenshot to extract 1. Emblem (crop), 2. Name, 3. Level
  const handleProcessAndScanImage = async (base64: string) => {
    setOriginalFullImage(base64);
    setCustomImage(base64);
    setIsAiScanning(true);
    setAiExtractedInfo(null);

    try {
      const res = await fetch('/api/ai/parse-guild-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const data = json.data;
        if (data.guildName) {
          setName(data.guildName);
        }
        if (typeof data.guildLevel === 'number') {
          setLevel(data.guildLevel);
          setIsNoLevel(false);
        }
        if (Array.isArray(data.emblemBox) && data.emblemBox.length === 4) {
          try {
            const cropped = await cropImageRegion(
              base64,
              data.emblemBox as [number, number, number, number]
            );
            setCroppedEmblemImage(cropped);
            setCustomImage(cropped);
            setUseCroppedEmblem(true);
          } catch (e) {
            console.warn('Emblem crop error:', e);
          }
        }
        setAiExtractedInfo({
          guildName: data.guildName,
          guildLevel: data.guildLevel,
          hasCroppedEmblem: Array.isArray(data.emblemBox) && data.emblemBox.length === 4,
        });
        setPasteSuccess(true);
        setTimeout(() => setPasteSuccess(false), 3500);
      }
    } catch (err) {
      console.warn('AI guild card extraction error:', err);
    } finally {
      setIsAiScanning(false);
    }
  };

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
              await handleProcessAndScanImage(base64);
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
        await handleProcessAndScanImage(base64);
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
      dropNote: dropType === 'other' ? dropNote.trim() || 'คนอื่นตี' : null,
      avatarIcon,
      customImage: customImage || null,
      note: note.trim() || null,
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
          {/* AI Guide & Auto-extract Banner explicitly requested */}
          <div className="p-3 bg-gradient-to-r from-indigo-950/70 via-[#0c1426] to-purple-950/50 border border-indigo-500/40 rounded-xl space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>ดึงข้อมูลกิลด์อัตโนมัติจากรูปภาพ (AI)</span>
              </div>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-full font-medium">
                Gemini 3.8 Flash
              </span>
            </div>

            {/* Instruction: 'ให้ส่งหน้านี้มาสำหรับเพิ่มกิล' */}
            <div className="p-2.5 bg-[#060a14] border border-slate-800 rounded-lg space-y-1.5">
              <div className="font-semibold text-amber-300 flex items-center gap-1.5 text-xs">
                <Info className="w-4 h-4 text-amber-400 shrink-0" />
                <span>📌 ให้ส่งหน้านี้มาสำหรับเพิ่มกิลด์: เมนู "แคลน" ➔ "ข้อมูลแคลน"</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                แคปหน้าจอเกมจากหน้า <strong>"ข้อมูลแคลน"</strong> แล้วกด <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-indigo-300 font-mono text-[10px]">Ctrl + V</kbd> หรืออัปโหลดรูป ระบบจะอ่านและกรอกข้อมูล 3 อย่างให้ทันที:
              </p>
              <div className="grid grid-cols-3 gap-1.5 pt-1 text-center text-[10px] font-semibold">
                <div className="p-1 rounded bg-indigo-950/50 border border-indigo-500/30 text-indigo-200">
                  ❶ รูปตรากิลด์ (ตัดให้)
                </div>
                <div className="p-1 rounded bg-indigo-950/50 border border-indigo-500/30 text-indigo-200">
                  ❷ ชื่อกิลด์
                </div>
                <div className="p-1 rounded bg-indigo-950/50 border border-indigo-500/30 text-indigo-200">
                  ❸ เลเวลกิลด์
                </div>
              </div>
            </div>

            {/* Scanning Indicator or Extraction Success Card */}
            {isAiScanning ? (
              <div className="p-3 bg-indigo-950/50 border border-indigo-500/60 rounded-lg text-center space-y-1 animate-pulse">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-indigo-300">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                  <span>AI กำลังอ่านรูปหน้าจอข้อมูลแคลน...</span>
                </div>
                <p className="text-[10px] text-slate-300">
                  กำลังดึง: ❶ รูปตรากิลด์ ➔ ❷ ชื่อกิลด์ ➔ ❸ เลเวลกิลด์
                </p>
              </div>
            ) : aiExtractedInfo ? (
              <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/50 rounded-lg space-y-1.5">
                <div className="flex items-center justify-between text-emerald-300 font-bold text-xs">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>ดึงข้อมูลจากหน้า "ข้อมูลแคลน" สำเร็จ!</span>
                  </span>
                  <span className="text-[10px] bg-emerald-900/60 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    ครบ 3 อย่าง
                  </span>
                </div>
                <div className="text-slate-200 text-[11px] flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span>❶ รูป: <strong className="text-emerald-300">ตัดตราสัญลักษณ์ให้แล้ว</strong></span>
                  <span>•</span>
                  <span>❷ ชื่อ: <strong className="text-amber-300 font-bold">{aiExtractedInfo.guildName || name}</strong></span>
                  <span>•</span>
                  <span>❸ เลเวล: <strong className="text-amber-300 font-bold">{aiExtractedInfo.guildLevel ?? level}</strong></span>
                </div>
              </div>
            ) : null}
          </div>

          {/* Avatar Icon & Ctrl+V Paste Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-300 font-medium">
                1. รูปภาพตราสัญลักษณ์กิลด์ (Emblem)
              </label>
              {pasteSuccess && (
                <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 animate-pulse">
                  <Check className="w-3 h-3" /> อัปเดตรูปสำเร็จ!
                </span>
              )}
            </div>

            {/* Custom Image Preview & Paste Box */}
            <div className="mb-2 p-2.5 rounded-xl border border-dashed border-indigo-500/40 bg-[#070b14] flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {customImage ? (
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-indigo-500/50 p-0.5 shadow-md relative overflow-hidden shrink-0">
                      <img src={customImage} alt="Custom Emblem" className="w-full h-full object-contain rounded-[10px]" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                      <ImageIcon className="w-5 h-5 text-indigo-400" />
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <span>{customImage ? 'ใช้รูปตรากิลด์' : 'วางรูป: กด Ctrl+V หรือเลือกไฟล์'}</span>
                      {customImage && (
                        <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded-full">
                          กำลังใช้งาน
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {customImage
                        ? 'กด Ctrl+V เพื่อวางรูปใหม่ได้ตลอดเวลา'
                        : 'ส่งภาพหน้าจอ "ข้อมูลแคลน" มาเพื่อดึงรูป+ชื่อ+เลเวล'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {customImage ? (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomImage('');
                        setCroppedEmblemImage('');
                        setOriginalFullImage('');
                      }}
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
                      <span>เลือกไฟล์ภาพ</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Toggle Cropped Emblem vs Full Image if both available */}
              {croppedEmblemImage && originalFullImage && croppedEmblemImage !== originalFullImage && (
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">ตัวเลือกการแสดงผลรูปภาพ:</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setCustomImage(croppedEmblemImage);
                        setUseCroppedEmblem(true);
                      }}
                      className={`px-2 py-0.5 rounded-md font-medium border transition-colors cursor-pointer flex items-center gap-1 ${
                        useCroppedEmblem
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-900 text-slate-400 border-slate-700'
                      }`}
                    >
                      <Crop className="w-3 h-3" />
                      <span>รูปตรากิลด์ (ตัดแล้ว)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomImage(originalFullImage);
                        setUseCroppedEmblem(false);
                      }}
                      className={`px-2 py-0.5 rounded-md font-medium border transition-colors cursor-pointer flex items-center gap-1 ${
                        !useCroppedEmblem
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-900 text-slate-400 border-slate-700'
                      }`}
                    >
                      <Layers className="w-3 h-3" />
                      <span>รูปเต็มทั้งภาพ</span>
                    </button>
                  </div>
                </div>
              )}

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

          {/* 2. Guild Name */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-indigo-950 border border-indigo-500/40 text-indigo-300 inline-flex items-center justify-center text-[10px] font-bold">2</span>
                <span>ชื่อกิลด์ (Guild Name)</span>
                <span className="text-rose-400">*</span>
              </label>
              {aiExtractedInfo?.guildName && (
                <span className="text-[10px] text-emerald-400 font-medium">✓ AI ดึงชื่อกิลด์ให้แล้ว</span>
              )}
            </div>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="เช่น SOLOLEVELING, THAILAND, Crows"
              className="w-full bg-[#070b14] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs font-chakra tracking-wide uppercase"
            />
          </div>

          {/* 3. Guild Level */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-indigo-950 border border-indigo-500/40 text-indigo-300 inline-flex items-center justify-center text-[10px] font-bold">3</span>
                <span>เลเวลกิลด์ (Guild Level)</span>
              </label>
              <div className="flex items-center gap-2">
                {aiExtractedInfo?.guildLevel !== undefined && (
                  <span className="text-[10px] text-emerald-400 font-medium">✓ AI ดึงเลเวลให้แล้ว</span>
                )}
                <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer text-[11px]">
                  <input
                    type="checkbox"
                    checked={isNoLevel}
                    onChange={e => setIsNoLevel(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-indigo-500"
                  />
                  <span>ไม่ระบุเลเวล</span>
                </label>
              </div>
            </div>
            {!isNoLevel && (
              <input
                type="number"
                min="1"
                max="100"
                value={level}
                onChange={e => setLevel(e.target.value)}
                placeholder="เช่น 12 หรือ 9"
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

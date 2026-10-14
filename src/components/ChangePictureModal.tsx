import React, { useState, useEffect, useRef } from 'react';
import { X, Image as ImageIcon, Upload, Check, Trash2, Sparkles, ClipboardCheck } from 'lucide-react';
import { GuildRaidItem } from '../types';
import { processImageFile } from '../utils/image';
import { GuildAvatar } from './GuildAvatar';

interface ChangePictureModalProps {
  isOpen: boolean;
  onClose: () => void;
  guild: GuildRaidItem | null;
  onSaveImage: (guildId: string, customImage: string | null | undefined) => void;
  initialPastedImage?: string; // If user pressed Ctrl+V globally before choosing guild
}

export const ChangePictureModal: React.FC<ChangePictureModalProps> = ({
  isOpen,
  onClose,
  guild,
  onSaveImage,
  initialPastedImage,
}) => {
  const [currentImage, setCurrentImage] = useState<string | null | undefined>(guild?.customImage || null);
  const [pasteSuccess, setPasteSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialPastedImage) {
      setCurrentImage(initialPastedImage);
      setPasteSuccess(true);
      setTimeout(() => setPasteSuccess(false), 2500);
    } else {
      setCurrentImage(guild?.customImage || null);
      setPasteSuccess(false);
    }
  }, [guild, initialPastedImage, isOpen]);

  // Listen for paste event specifically inside modal
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
              setCurrentImage(base64);
              setPasteSuccess(true);
              setTimeout(() => setPasteSuccess(false), 2500);
            } catch (err) {
              console.error('Failed to process pasted image:', err);
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
        setCurrentImage(base64);
        setPasteSuccess(true);
        setTimeout(() => setPasteSuccess(false), 2500);
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      try {
        const base64 = await processImageFile(file);
        setCurrentImage(base64);
        setPasteSuccess(true);
        setTimeout(() => setPasteSuccess(false), 2500);
      } catch (err) {
        console.error('Drop failed:', err);
      }
    }
  };

  const handleSave = () => {
    if (!guild) return;
    onSaveImage(guild.id, currentImage);
    onClose();
  };

  if (!isOpen || !guild) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0e1424] border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-950/70 border border-indigo-500/30 rounded-xl text-indigo-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>เปลี่ยนรูปกิลด์: {guild.name}</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                รองรับการกด <kbd className="bg-slate-900 border border-slate-700 px-1 py-0.5 rounded text-[10px] font-mono text-indigo-300">Ctrl+V</kbd> วางรูปได้ทันที
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-4">
          {/* Comparison / Preview Box */}
          <div className="flex items-center justify-center gap-6 p-4 rounded-xl bg-[#080c16] border border-slate-800/80">
            <div className="text-center">
              <div className="text-[11px] text-slate-400 mb-1.5 font-medium">รูปที่กำลังใช้งาน</div>
              <GuildAvatar
                icon={guild.avatarIcon}
                customImage={currentImage}
                className="w-18 h-18 mx-auto"
              />
              <div className="text-[11px] text-slate-300 mt-2 font-semibold truncate max-w-[100px]">
                {guild.name}
              </div>
            </div>

            {currentImage && (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentImage(undefined)}
                  className="px-2.5 py-1.5 bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="รีเซ็ตกลับเป็นสัญลักษณ์เริ่มต้นของเกม"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ใช้สัญลักษณ์เดิม</span>
                </button>
              </div>
            )}
          </div>

          {/* Paste / Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center relative overflow-hidden ${
              isDragging
                ? 'border-indigo-400 bg-indigo-950/30'
                : 'border-indigo-500/40 bg-[#090e1c] hover:border-indigo-400/80 hover:bg-[#0c1224]'
            }`}
          >
            {pasteSuccess && (
              <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-xs flex items-center justify-center gap-2 text-emerald-300 font-semibold text-xs z-10 animate-fadeIn">
                <ClipboardCheck className="w-5 h-5 text-emerald-400" />
                <span>ตรวจพบและวางรูปภาพสำเร็จแล้ว!</span>
              </div>
            )}

            <div className="w-12 h-12 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-3 shadow-md">
              <Upload className="w-6 h-6" />
            </div>

            <div className="text-sm font-bold text-white flex items-center justify-center gap-2">
              <span>กด</span>
              <span className="px-2 py-0.5 bg-indigo-900/60 border border-indigo-500/40 text-indigo-200 rounded-lg font-mono text-xs shadow-sm">
                Ctrl + V
              </span>
              <span>เพื่อวางรูปภาพได้ทันที</span>
            </div>

            <p className="text-xs text-slate-400 mt-1.5">
              คัดลอกจากเบราว์เซอร์, สกรีนช็อต (PrintScreen), แคปจอ Discord หรือคลิกเพื่อเลือกไฟล์รูปภาพ
            </p>

            <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-indigo-300 bg-indigo-950/40 border border-indigo-500/20 px-3 py-1 rounded-full">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>หรือลากไฟล์ภาพมาปล่อยที่นี่ (Drag & Drop)</span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Tips */}
          <div className="text-[11px] text-slate-400 bg-[#080d18] border border-slate-800 p-3 rounded-xl space-y-1">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              💡 วิธีเปลี่ยนรูปภาพอย่างรวดเร็ว:
            </div>
            <div>1. คัดลอกรูปภาพหรือกดปุ่ม Snipping Tool (Win+Shift+S) เพื่อแคปรูป</div>
            <div>2. คลิกที่หน้านี้แล้วกดปุ่ม <span className="text-indigo-300 font-mono">Ctrl + V</span> บนคีย์บอร์ด</div>
            <div>3. รูปภาพจะปรากฏขึ้นมาทันที และบันทึกลงระบบแบบเรียลไทม์</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>บันทึกรูปภาพ</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Pencil, Trash2, Users, CheckCircle2, Circle, Camera, Image as ImageIcon, Sparkles } from 'lucide-react';
import { GuildRaidItem } from '../types';
import { GuildAvatar } from './GuildAvatar';
import { processImageFile } from '../utils/image';

interface GuildCardProps {
  item: GuildRaidItem;
  isSelected?: boolean;
  onToggleStatus: (id: string) => void;
  onEdit: (item: GuildRaidItem) => void;
  onDelete: (id: string) => void;
  onChangePicture: (item: GuildRaidItem) => void;
  onDropImage?: (guildId: string, imageBase64: string) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const GuildCard: React.FC<GuildCardProps> = ({
  item,
  isSelected = false,
  onToggleStatus,
  onEdit,
  onDelete,
  onChangePicture,
  onDropImage,
  onMouseEnter,
  onMouseLeave,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const isBeaten = item.status === 'beaten';

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/') && onDropImage) {
      try {
        const base64 = await processImageFile(file);
        onDropImage(item.id, base64);
      } catch (err) {
        console.error('Failed to handle drop image:', err);
      }
    }
  };

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`rounded-2xl p-4 sm:p-5 transition-all duration-200 relative flex flex-col justify-between group ${
        isDragOver
          ? 'ring-2 ring-indigo-400 bg-indigo-950/40 border-indigo-400'
          : isSelected
          ? 'ring-2 ring-indigo-500/50 bg-[#0d162a] border-indigo-500/40'
          : isBeaten
          ? 'bg-[#0d1525] border border-emerald-500/40 shadow-lg shadow-emerald-950/20'
          : 'bg-[#0b101d] border border-slate-800/80 hover:border-slate-700/80'
      }`}
    >
      {/* Top Section */}
      <div>
        <div className="flex items-start justify-between gap-3">
          {/* Avatar & Guild Information */}
          <div className="flex items-center gap-3">
            {/* Clickable Avatar to Change Picture */}
            <div
              onClick={() => onChangePicture(item)}
              className="relative cursor-pointer group/avatar shrink-0"
              title="คลิกเพื่อเปลี่ยนรูป หรือชี้แล้วกด Ctrl+V เพื่อวางรูปภาพ"
            >
              <GuildAvatar
                icon={item.avatarIcon}
                customImage={item.customImage}
                className="w-13 h-13 shrink-0 transition-transform group-hover/avatar:scale-105"
              />
              {/* Hover overlay with camera icon */}
              <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-[1px] rounded-xl opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                <Camera className="w-4 h-4 text-indigo-300" />
                <span className="text-[8px] font-semibold text-indigo-200 mt-0.5 leading-none">
                  Ctrl+V
                </span>
              </div>

              {item.customImage && (
                <div
                  className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-indigo-500 rounded-full border-2 border-[#0b101d] flex items-center justify-center"
                  title="ใช้รูปภาพแบบกำหนดเอง"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide uppercase font-chakra">
                  {item.name}
                </h3>
                {isBeaten && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                    ตีแล้ว
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>{item.level ? `Lv.${item.level}` : 'ไม่ระบุเลเวล'}</span>
                </div>

                {/* Quick Change Picture link on text */}
                <button
                  type="button"
                  onClick={() => onChangePicture(item)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 underline opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 cursor-pointer"
                  title="เปลี่ยนรูปภาพหรือกด Ctrl+V"
                >
                  <ImageIcon className="w-3 h-3" />
                  <span>เปลี่ยนรูป (Ctrl+V)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onChangePicture(item)}
              className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
              title="เปลี่ยนรูปภาพกิลด์ (รองรับ Ctrl+V)"
            >
              <Camera className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(item)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
              title="แก้ไขข้อมูลกิลด์"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Drop Type & Note Badges */}
        <div className="mt-3.5 flex items-center gap-2 flex-wrap">
          {item.dropType === 'inventory' && (
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-[#04241d] text-emerald-300 border border-emerald-500/50 font-medium shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>1.ของเข้าตัว</span>
            </span>
          )}

          {item.dropType === 'guild' && (
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-[#0c1f38] text-blue-300 border border-blue-500/50 font-medium shadow-xs">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>2.เข้ากิล</span>
            </span>
          )}

          {item.dropType === 'other' && (
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-[#241707] text-amber-300 border border-amber-500/50 font-medium shadow-xs">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>3.อื่นๆ{item.dropNote ? `: ${item.dropNote}` : ''}</span>
            </span>
          )}

          {/* Additional Note (หมายเหตุ) */}
          {item.note && (
            <span
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-[#1b170c] text-amber-200 border border-amber-500/40 font-medium shadow-xs"
              title={`หมายเหตุ: ${item.note}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-amber-400/90 font-semibold">หมายเหตุ:</span>
              <span>{item.note}</span>
            </span>
          )}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="mt-5 flex items-center gap-2 pt-1">
        <button
          onClick={() => onToggleStatus(item.id)}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            isBeaten
              ? 'bg-[#059669] hover:bg-[#047857] text-white shadow-md shadow-emerald-950/40'
              : 'bg-[#131b2e] hover:bg-[#1a253e] text-slate-300 border border-slate-800'
          }`}
        >
          {isBeaten ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>ตีแล้วเรียบร้อย</span>
            </>
          ) : (
            <>
              <Circle className="w-4 h-4 text-slate-400" />
              <span>ยังไม่ได้ตี</span>
            </>
          )}
        </button>

        <button
          onClick={() => onDelete(item.id)}
          className="p-2.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer"
          title="ลบกิลด์นี้"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

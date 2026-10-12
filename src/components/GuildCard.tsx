import React from 'react';
import { Pencil, Trash2, Users, CheckCircle2, Circle } from 'lucide-react';
import { GuildRaidItem } from '../types';
import { GuildAvatar } from './GuildAvatar';

interface GuildCardProps {
  item: GuildRaidItem;
  onToggleStatus: (id: string) => void;
  onEdit: (item: GuildRaidItem) => void;
  onDelete: (id: string) => void;
}

export const GuildCard: React.FC<GuildCardProps> = ({
  item,
  onToggleStatus,
  onEdit,
  onDelete,
}) => {
  const isBeaten = item.status === 'beaten';

  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 transition-all duration-200 relative flex flex-col justify-between ${
        isBeaten
          ? 'bg-[#0d1525] border border-emerald-500/40 shadow-lg shadow-emerald-950/20'
          : 'bg-[#0b101d] border border-slate-800/80 hover:border-slate-700/80'
      }`}
    >
      {/* Top Section */}
      <div>
        <div className="flex items-start justify-between gap-3">
          {/* Avatar & Guild Information */}
          <div className="flex items-center gap-3">
            <GuildAvatar icon={item.avatarIcon} className="w-13 h-13 shrink-0" />
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
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>{item.level ? `Lv.${item.level}` : 'ไม่ระบุเลเวล'}</span>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
            title="แก้ไขข้อมูลกิลด์"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>

        {/* Drop Type Badge */}
        <div className="mt-3.5 flex items-center gap-2">
          {item.dropType === 'inventory' && (
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>1.ของเข้าตัว</span>
            </span>
          )}

          {item.dropType === 'guild' && (
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-blue-950/60 text-blue-300 border border-blue-500/30 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span>2.เข้ากิล</span>
            </span>
          )}

          {item.dropType === 'other' && (
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-amber-950/60 text-amber-300 border border-amber-500/30 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>3.อื่นๆ: {item.dropNote || 'คนอื่นตี'}</span>
            </span>
          )}

          {item.note && (
            <span className="text-[11px] text-slate-400 truncate max-w-[160px]" title={item.note}>
              ({item.note})
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

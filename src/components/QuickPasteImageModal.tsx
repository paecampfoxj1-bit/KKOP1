import React, { useState } from 'react';
import { X, Check, Search, Plus, Sparkles, Building2 } from 'lucide-react';
import { GuildRaidItem } from '../types';
import { GuildAvatar } from './GuildAvatar';

interface QuickPasteImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  pastedImage: string;
  guilds: GuildRaidItem[];
  onApplyToGuild: (guildId: string, image: string) => void;
  onCreateNewWithImage: (image: string) => void;
}

export const QuickPasteImageModal: React.FC<QuickPasteImageModalProps> = ({
  isOpen,
  onClose,
  pastedImage,
  guilds,
  onApplyToGuild,
  onCreateNewWithImage,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredGuilds = guilds.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    (g.level && g.level.toString().includes(search))
  );

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0e1424] border border-slate-800 rounded-2xl w-full max-w-lg p-5 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-indigo-500/50 p-0.5 shadow-md relative overflow-hidden shrink-0">
              <img
                src={pastedImage}
                alt="Pasted Preview"
                className="w-full h-full object-cover rounded-[10px]"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  ตรวจพบรูปภาพจาก Ctrl+V!
                </h3>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-medium">
                  พร้อมใช้งาน
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                เลือกกิลด์ที่ต้องการเปลี่ยนรูปภาพ หรือสร้างกิลด์ใหม่ด้วยรูปนี้
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

        {/* Search */}
        <div className="my-3 shrink-0 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ค้นหากิลด์ที่ต้องการเปลี่ยนรูป..."
            className="w-full bg-[#080d1a] border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            autoFocus
          />
        </div>

        {/* Guilds List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 my-1">
          {filteredGuilds.length > 0 ? (
            filteredGuilds.map(guild => (
              <div
                key={guild.id}
                onClick={() => onApplyToGuild(guild.id, pastedImage)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#090e1c] hover:bg-[#131b2f] border border-slate-800/80 hover:border-indigo-500/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <GuildAvatar
                    icon={guild.avatarIcon}
                    customImage={guild.customImage}
                    className="w-10 h-10 shrink-0"
                  />
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {guild.name}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {guild.level ? `Lv.${guild.level}` : 'ไม่ระบุเลเวล'} • {guild.status === 'beaten' ? 'ตีแล้ว' : 'ยังไม่ได้ตี'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-950/70 text-indigo-300 border border-indigo-500/30 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-all flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>เปลี่ยนเป็นรูปนี้</span>
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-xs text-slate-500">
              ไม่พบกิลด์ที่ตรงกับคำค้นหา
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between shrink-0 gap-2">
          <button
            type="button"
            onClick={() => onCreateNewWithImage(pastedImage)}
            className="px-3 py-2 text-xs font-medium bg-[#12192e] hover:bg-[#1a2542] text-indigo-300 border border-indigo-500/30 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>สร้างกิลด์ใหม่ด้วยรูปนี้</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};

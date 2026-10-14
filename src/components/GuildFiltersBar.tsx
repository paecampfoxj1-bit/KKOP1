import React from 'react';
import { Search, Plus, ArrowDownUp, Camera, Image as ImageIcon } from 'lucide-react';
import { DropType } from '../types';

interface GuildFiltersBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: 'all' | 'unbeaten' | 'beaten';
  setStatusFilter: (f: 'all' | 'unbeaten' | 'beaten') => void;
  dropFilter: 'all' | DropType;
  setDropFilter: (d: 'all' | DropType) => void;
  sortBy: 'unbeaten_level_desc' | 'unbeaten_level_asc' | 'beaten_first' | 'name_asc';
  setSortBy: (s: 'unbeaten_level_desc' | 'unbeaten_level_asc' | 'beaten_first' | 'name_asc') => void;
  counts: {
    total: number;
    unbeaten: number;
    beaten: number;
  };
  onOpenAddModal: () => void;
  onPasteImageClick: () => void;
  onOpenAiRaidCheck: () => void;
  onImageDroppedOrPasted?: (imageBase64: string) => void;
}

export const GuildFiltersBar: React.FC<GuildFiltersBarProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  dropFilter,
  setDropFilter,
  sortBy,
  setSortBy,
  counts,
  onOpenAddModal,
  onPasteImageClick,
  onOpenAiRaidCheck,
  onImageDroppedOrPasted,
}) => {
  const handleSearchPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file && onImageDroppedOrPasted) {
          e.preventDefault();
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              onImageDroppedOrPasted(reader.result);
            }
          };
          reader.readAsDataURL(file);
          break;
        }
      }
    }
  };

  const handleSearchDrop = (e: React.DragEvent<HTMLDivElement>) => {
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/') && onImageDroppedOrPasted) {
      e.preventDefault();
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onImageDroppedOrPasted(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Top Search & Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input with Camera AI Check Icon */}
        <div
          className="relative flex-1"
          onDragOver={e => e.preventDefault()}
          onDrop={handleSearchDrop}
        >
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onPaste={handleSearchPaste}
            placeholder="ค้นหากิลด์, เลเวล, ของดรอป, บอส..."
            className="w-full bg-[#0c1220] border border-slate-800 rounded-xl pl-10 pr-12 sm:pr-28 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
          />
          {/* Camera Button for AI Vision Raid Check */}
          <button
            type="button"
            onClick={onOpenAiRaidCheck}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-gradient-to-r from-indigo-500/15 to-purple-500/15 hover:from-indigo-500/25 hover:to-purple-500/25 text-indigo-300 hover:text-white border border-indigo-500/30 hover:border-indigo-500/60 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-xs group"
            title="📷 ส่งรูปเพื่อตรวจหากิลด์ที่มีคำว่า 'เข้าร่วมทันที' และกิลด์ที่ยังไม่ได้ลงเรด"
          >
            <Camera className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline text-[11px] font-semibold text-indigo-300">
              ถาม AI จากรูป
            </span>
          </button>
        </div>

        {/* Change Picture (Ctrl+V) & Add Guild Button */}
        <div className="flex items-center gap-2 justify-end flex-wrap sm:flex-nowrap">
          <button
            onClick={onPasteImageClick}
            className="px-3 py-2 bg-[#0c1220] hover:bg-[#131b2f] border border-indigo-500/40 hover:border-indigo-500 text-indigo-300 rounded-xl text-xs font-medium flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            title="กดปุ่ม Ctrl+V บนคีย์บอร์ด หรือคลิกที่นี่เพื่อวางและเปลี่ยนรูปภาพกิลด์"
          >
            <Camera className="w-3.5 h-3.5 text-indigo-400" />
            <span>เปลี่ยนรูป: กด <kbd className="bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-[10px] font-mono text-indigo-200 shadow-xs">Ctrl+V</kbd> วางรูปได้</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
            title="เพิ่มกิลด์ใหม่ (รองรับการวางรูปหน้าจอ 'แคลน > ข้อมูลแคลน' เพื่อให้ AI ดึง รูป, ชื่อ, และเลเวล ให้อัตโนมัติ)"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มกิลด์ใหม่</span>
          </button>
        </div>
      </div>

      {/* Filter and Sort Tabs Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          {/* Status Tabs Segment */}
          <div className="inline-flex items-center p-1 bg-[#0c1220] rounded-xl border border-slate-800/80 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ทั้งหมด ({counts.total})
            </button>
            <button
              onClick={() => setStatusFilter('unbeaten')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                statusFilter === 'unbeaten'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ยังไม่ได้ตี ({counts.unbeaten})
            </button>
            <button
              onClick={() => setStatusFilter('beaten')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                statusFilter === 'beaten'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ตีแล้ว ({counts.beaten})
            </button>
          </div>

          {/* Drop Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-1">
            <button
              onClick={() => setDropFilter('all')}
              className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                dropFilter === 'all'
                  ? 'bg-slate-800 border-slate-600 text-white font-medium'
                  : 'bg-transparent border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              ของดรอปทั้งหมด
            </button>
            <button
              onClick={() => setDropFilter('inventory')}
              className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                dropFilter === 'inventory'
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 font-medium'
                  : 'bg-transparent border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>1.ของเข้าตัว</span>
            </button>
            <button
              onClick={() => setDropFilter('guild')}
              className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                dropFilter === 'guild'
                  ? 'bg-blue-950/80 border-blue-500/50 text-blue-300 font-medium'
                  : 'bg-transparent border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span>2.เข้ากิล</span>
            </button>
            <button
              onClick={() => setDropFilter('other')}
              className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                dropFilter === 'other'
                  ? 'bg-amber-950/80 border-amber-500/50 text-amber-300 font-medium'
                  : 'bg-transparent border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>3.อื่นๆ</span>
            </button>
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <ArrowDownUp className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-400 hidden sm:inline">เรียงตาม:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="bg-[#0c1220] border border-slate-800 text-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="unbeaten_level_desc">ยังไม่ตี (Lv. มากไปน้อย)</option>
            <option value="unbeaten_level_asc">ยังไม่ตี (Lv. น้อยไปมาก)</option>
            <option value="beaten_first">ตีแล้วก่อน</option>
            <option value="name_asc">ชื่อกิลด์ (A-Z)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

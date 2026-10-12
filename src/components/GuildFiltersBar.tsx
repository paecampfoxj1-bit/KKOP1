import React from 'react';
import { Search, Clipboard, Plus, ArrowDownUp } from 'lucide-react';
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
  onQuickPaste: () => void;
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
  onQuickPaste,
}) => {
  return (
    <div className="space-y-3.5">
      {/* Top Search & Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ค้นหากิลด์, เลเวล, ของดรอป, บอส..."
            className="w-full bg-[#0c1220] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
          />
        </div>

        {/* Quick Paste & Add Guild Button */}
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={onQuickPaste}
            className="px-3 py-2 bg-[#0c1220] hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
            title="คลิกเพื่อพิมพ์ชื่อกิลด์ด่วน หรือกดปุ่ม Ctrl+V บนคีย์บอร์ดได้ทันที"
          >
            <Clipboard className="w-3.5 h-3.5 text-slate-400" />
            <span>กด <kbd className="bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-200">Ctrl+V</kbd> เขียนชื่อกิลด์ได้ทันที</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
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

          {/* Loot / Drop Destination Tabs */}
          <div className="flex items-center gap-1.5 text-xs overflow-x-auto scrollbar-none">
            <span className="text-slate-400 text-xs font-medium mr-1 whitespace-nowrap">ของดรอป:</span>

            <button
              onClick={() => setDropFilter('all')}
              className={`px-3 py-1.5 rounded-xl border transition-colors cursor-pointer whitespace-nowrap ${
                dropFilter === 'all'
                  ? 'bg-slate-800 text-white border-slate-600 font-semibold'
                  : 'bg-[#0c1220] text-slate-400 border-slate-800/80 hover:text-slate-200'
              }`}
            >
              ทั้งหมด
            </button>

            <button
              onClick={() => setDropFilter('inventory')}
              className={`px-3 py-1.5 rounded-xl border transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                dropFilter === 'inventory'
                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/50 font-semibold'
                  : 'bg-[#0c1220] text-slate-400 border-slate-800/80 hover:text-slate-200'
              }`}
            >
              <span>👛</span>
              <span>ของเข้าตัว</span>
            </button>

            <button
              onClick={() => setDropFilter('guild')}
              className={`px-3 py-1.5 rounded-xl border transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                dropFilter === 'guild'
                  ? 'bg-blue-950/70 text-blue-300 border-blue-500/50 font-semibold'
                  : 'bg-[#0c1220] text-slate-400 border-slate-800/80 hover:text-slate-200'
              }`}
            >
              <span>🏰</span>
              <span>เข้ากิล</span>
            </button>

            <button
              onClick={() => setDropFilter('other')}
              className={`px-3 py-1.5 rounded-xl border transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                dropFilter === 'other'
                  ? 'bg-amber-950/70 text-amber-300 border-amber-500/50 font-semibold'
                  : 'bg-[#0c1220] text-slate-400 border-slate-800/80 hover:text-slate-200'
              }`}
            >
              <span>❓</span>
              <span>อื่นๆ</span>
            </button>
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <div className="flex items-center gap-1.5 bg-[#0c1220] border border-slate-800/80 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <ArrowDownUp className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer pr-2"
            >
              <option value="unbeaten_level_desc" className="bg-slate-900 text-white">
                ยังไม่ตีบนสุด · Lv. มาก ➔ น้อย
              </option>
              <option value="unbeaten_level_asc" className="bg-slate-900 text-white">
                ยังไม่ตีบนสุด · Lv. น้อย ➔ มาก
              </option>
              <option value="beaten_first" className="bg-slate-900 text-white">
                ตีแล้วบนสุด
              </option>
              <option value="name_asc" className="bg-slate-900 text-white">
                ชื่อกิลด์ (ก-ฮ / A-Z)
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

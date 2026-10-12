import React from 'react';
import { Users, UserCheck, CheckCircle2, Crosshair, Flame } from 'lucide-react';
import { GuildMember } from '../types';

interface StatsCardsProps {
  members: GuildMember[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ members }) => {
  const total = members.length;
  const checkedInCount = members.filter(m => m.checkedIn).length;
  const completeCount = members.filter(m => (m.hits || 0) >= 3).length;
  const remainingHits = members.reduce((sum, m) => sum + Math.max(0, 3 - (m.hits || 0)), 0);
  const totalDamage = members.reduce((sum, m) => sum + (Number(m.damage) || 0), 0);

  const checkedPct = total > 0 ? Math.round((checkedInCount / total) * 100) : 0;
  const completePct = total > 0 ? Math.round((completeCount / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
      {/* Total Members */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span>สมาชิกกิลด์</span>
          <Users className="w-4 h-4 text-slate-500" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-chakra text-white">{total}</span>
          <span className="text-xs text-slate-400">คน</span>
        </div>
        <div className="text-[11px] text-slate-500 mt-1">กิลด์รอง KKop</div>
      </div>

      {/* Checked In */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span>เช็คชื่อแล้ว</span>
          <UserCheck className="w-4 h-4 text-blue-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-chakra text-blue-400">{checkedInCount}</span>
          <span className="text-xs text-slate-400">({checkedPct}%)</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
          <div
            className="bg-blue-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${checkedPct}%` }}
          />
        </div>
      </div>

      {/* Raid Completed (3/3) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span>ลงเรดครบ (3/3)</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-chakra text-emerald-400">{completeCount}</span>
          <span className="text-xs text-slate-400">({completePct}%)</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${completePct}%` }}
          />
        </div>
      </div>

      {/* Remaining Hits */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span>รอบตีคงเหลือ</span>
          <Crosshair className="w-4 h-4 text-amber-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-chakra text-amber-400">{remainingHits}</span>
          <span className="text-xs text-slate-400">รอบ</span>
        </div>
        <div className="text-[11px] text-slate-500 mt-1">ยังไม่ได้ลงเรด</div>
      </div>

      {/* Total Clan Damage */}
      <div className="col-span-2 lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span>ดาเมจรวมแคลน</span>
          <Flame className="w-4 h-4 text-rose-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-chakra text-rose-400">
            {totalDamage.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          </span>
          <span className="text-xs text-slate-400">ล้าน</span>
        </div>
        <div className="text-[11px] text-slate-500 mt-1">ผลงานสัปดาห์นี้</div>
      </div>
    </div>
  );
};

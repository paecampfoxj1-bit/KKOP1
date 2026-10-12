import React from 'react';
import {
  Search,
  CheckCheck,
  UserCheck,
  Minus,
  Plus,
  Edit2,
  Trash2,
  UsersRound,
  Shield,
  Award,
  Sparkles
} from 'lucide-react';
import { GuildMember } from '../types';

interface MembersTableProps {
  members: GuildMember[];
  filter: string;
  setFilter: (f: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onToggleCheckIn: (id: string) => void;
  onChangeHits: (id: string, delta: number) => void;
  onSetHitsMax: (id: string) => void;
  onOpenEditMember: (member: GuildMember) => void;
  onDeleteMember: (id: string) => void;
  onCheckInAll: () => void;
  onOpenAddMember: () => void;
}

export const MembersTable: React.FC<MembersTableProps> = ({
  members,
  filter,
  setFilter,
  searchQuery,
  setSearchQuery,
  onToggleCheckIn,
  onChangeHits,
  onSetHitsMax,
  onOpenEditMember,
  onDeleteMember,
  onCheckInAll,
  onOpenAddMember,
}) => {
  // Compute counts
  const totalCount = members.length;
  const zeroCount = members.filter(m => (m.hits || 0) === 0).length;
  const partialCount = members.filter(m => (m.hits || 0) > 0 && (m.hits || 0) < 3).length;
  const completeCount = members.filter(m => (m.hits || 0) >= 3).length;
  const notCheckedCount = members.filter(m => !m.checkedIn).length;

  // Filter members
  const filteredMembers = members.filter(m => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = m.name.toLowerCase().includes(q);
      const matchRole = (m.role || '').toLowerCase().includes(q);
      const matchNote = (m.note || '').toLowerCase().includes(q);
      if (!matchName && !matchRole && !matchNote) return false;
    }

    switch (filter) {
      case 'zero':
        return (m.hits || 0) === 0;
      case 'partial':
        return (m.hits || 0) > 0 && (m.hits || 0) < 3;
      case 'complete':
        return (m.hits || 0) >= 3;
      case 'not_checked':
        return !m.checkedIn;
      default:
        return true;
    }
  });

  const getRoleBadge = (role: string) => {
    if (role.includes('หัวหน้ากิลด์')) {
      return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
    }
    if (role.includes('รอง')) {
      return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
    }
    if (role.includes('สมาชิกหลัก')) {
      return 'bg-blue-500/10 text-blue-300 border-blue-500/30';
    }
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  return (
    <div className="space-y-4">
      {/* Filters & Search Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 sm:p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              filter === 'all'
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            ทั้งหมด ({totalCount})
          </button>
          <button
            onClick={() => setFilter('zero')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              filter === 'zero'
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            ยังไม่ตี 0/3 ({zeroCount})
          </button>
          <button
            onClick={() => setFilter('partial')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              filter === 'partial'
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            กำลังตี 1-2/3 ({partialCount})
          </button>
          <button
            onClick={() => setFilter('complete')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              filter === 'complete'
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            ตีครบ 3/3 ({completeCount})
          </button>
          <button
            onClick={() => setFilter('not_checked')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              filter === 'not_checked'
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            ยังไม่เช็คชื่อ ({notCheckedCount})
          </button>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อสมาชิก..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <button
            onClick={onCheckInAll}
            className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5"
          >
            <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">เช็คชื่อทั้งหมด</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        {filteredMembers.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-3">
            <UsersRound className="w-10 h-10 mx-auto text-slate-600" />
            <p className="text-sm">ไม่พบรายชื่อสมาชิกตามเงื่อนไขที่เลือก</p>
            <button
              onClick={onOpenAddMember}
              className="px-3.5 py-1.5 text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-lg shadow-sm"
            >
              + เพิ่มสมาชิกใหม่
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                <tr>
                  <th scope="col" className="py-3 px-3 sm:px-4">#</th>
                  <th scope="col" className="py-3 px-3 sm:px-4">สมาชิก</th>
                  <th scope="col" className="py-3 px-3 sm:px-4 text-center">เช็คชื่อ</th>
                  <th scope="col" className="py-3 px-3 sm:px-4 text-center">สถานะเรด (0-3 รอบ)</th>
                  <th scope="col" className="py-3 px-3 sm:px-4 text-right">ดาเมจ (M)</th>
                  <th scope="col" className="py-3 px-3 sm:px-4">หมายเหตุ</th>
                  <th scope="col" className="py-3 px-3 sm:px-4 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredMembers.map((member, index) => {
                  const hits = member.hits || 0;
                  const isComplete = hits >= 3;
                  const isPartial = hits > 0 && hits < 3;

                  let hitPillClass = 'bg-red-500/10 text-rose-400 border-rose-500/30';
                  if (isComplete) {
                    hitPillClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
                  } else if (isPartial) {
                    hitPillClass = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
                  }

                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-slate-800/40 transition-colors border-b border-slate-800/60"
                    >
                      {/* Number */}
                      <td className="py-3 px-3 sm:px-4 text-slate-500 font-mono text-xs">
                        {index + 1}
                      </td>

                      {/* Member Info */}
                      <td className="py-3 px-3 sm:px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-amber-400 font-chakra shrink-0">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-white flex items-center gap-1.5">
                              <span>{member.name}</span>
                              {isComplete && (
                                <span title="ตีครบ 3/3">
                                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                </span>
                              )}
                            </div>
                            <span
                              className={`inline-block text-[10px] px-1.5 py-0.2 rounded border ${getRoleBadge(
                                member.role
                              )}`}
                            >
                              {member.role || 'สมาชิก'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Check-in toggle */}
                      <td className="py-3 px-3 sm:px-4 text-center">
                        <button
                          onClick={() => onToggleCheckIn(member.id)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                            member.checkedIn
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 hover:bg-blue-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                          }`}
                        >
                          <span className="flex items-center justify-center gap-1">
                            {member.checkedIn ? (
                              <>
                                <UserCheck className="w-3 h-3 text-blue-400" />
                                <span>เช็คชื่อแล้ว</span>
                              </>
                            ) : (
                              <>
                                <Minus className="w-3 h-3 text-slate-500" />
                                <span>ยังไม่เช็ค</span>
                              </>
                            )}
                          </span>
                        </button>
                      </td>

                      {/* Raid Hits (0-3) */}
                      <td className="py-3 px-3 sm:px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                          <button
                            onClick={() => onChangeHits(member.id, -1)}
                            disabled={hits <= 0}
                            className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                            title="ลดรอบตี"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className={`px-2 py-0.5 rounded text-xs font-chakra font-bold border ${hitPillClass}`}>
                            {hits}/3
                          </span>
                          <button
                            onClick={() => onChangeHits(member.id, 1)}
                            disabled={hits >= 3}
                            className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                            title="เพิ่มรอบตี"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => onSetHitsMax(member.id)}
                            className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-emerald-600/30 text-slate-300 hover:text-emerald-300 transition-colors"
                            title="ลงเรดครบ 3/3 ทันที"
                          >
                            MAX
                          </button>
                        </div>
                      </td>

                      {/* Damage */}
                      <td className="py-3 px-3 sm:px-4 text-right">
                        <div className="font-chakra font-semibold text-rose-300">
                          {(Number(member.damage) || 0).toFixed(1)} M
                        </div>
                      </td>

                      {/* Note */}
                      <td
                        className="py-3 px-3 sm:px-4 text-slate-400 text-[11px] max-w-[160px] truncate"
                        title={member.note || '-'}
                      >
                        {member.note || '-'}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 sm:px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onOpenEditMember(member)}
                            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors"
                            title="แก้ไข"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteMember(member.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                            title="ลบ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

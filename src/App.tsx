/**
 * KKop Guild Sub-Clan Raid Tracker & Attendance System
 * High-fidelity recreation matching user's reference UI with Wednesday 05:00 AM Auto-Reset & Firebase Sync
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { WednesdayBanner } from './components/WednesdayBanner';
import { GuildFiltersBar } from './components/GuildFiltersBar';
import { GuildCard } from './components/GuildCard';
import { AddGuildModal } from './components/AddGuildModal';
import { ExportModal } from './components/ExportModal';
import { FirebaseModal } from './components/FirebaseModal';
import { CodeViewer } from './components/CodeViewer';
import { DeployGuide } from './components/DeployGuide';
import { calculateWednesdayCycleInfo } from './utils/cycle';
import { GuildRaidItem, DropType, WeeklyCycleInfo, FirebaseConnectionConfig } from './types';
import { ShieldAlert, UsersRound, Sparkles } from 'lucide-react';

// Initial default guilds exactly matching the screenshot
const INITIAL_DEMO_GUILDS: GuildRaidItem[] = [
  {
    id: 'g1',
    name: 'SOLOLEVELING',
    level: 12,
    status: 'unbeaten',
    dropType: 'inventory',
    avatarIcon: 'dragon',
    updatedAt: Date.now(),
  },
  {
    id: 'g2',
    name: 'THAILAND',
    level: 12,
    status: 'unbeaten',
    dropType: 'inventory',
    avatarIcon: 'lion',
    updatedAt: Date.now(),
  },
  {
    id: 'g3',
    name: 'Crows',
    level: 10,
    status: 'beaten',
    dropType: 'inventory',
    avatarIcon: 'crows',
    beatenAt: Date.now() - 3600000,
    updatedAt: Date.now(),
  },
  {
    id: 'g4',
    name: 'DMTH',
    level: null, // ไม่ระบุเลเวล
    status: 'beaten',
    dropType: 'other',
    dropNote: 'คนอื่นตี',
    avatarIcon: 'devil',
    beatenAt: Date.now() - 7200000,
    updatedAt: Date.now(),
  },
];

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning';
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'tracker' | 'code' | 'deploy'>('tracker');
  const [guilds, setGuilds] = useState<GuildRaidItem[]>(() => {
    const saved = localStorage.getItem('kkop_guild_items');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_DEMO_GUILDS;
      }
    }
    return INITIAL_DEMO_GUILDS;
  });

  const [activeCycleKey, setActiveCycleKey] = useState<string>(() => {
    return localStorage.getItem('kkop_active_cycle_key') || '';
  });

  const [cycleInfo, setCycleInfo] = useState<WeeklyCycleInfo>(calculateWednesdayCycleInfo);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unbeaten' | 'beaten'>('all');
  const [dropFilter, setDropFilter] = useState<'all' | DropType>('all');
  const [sortBy, setSortBy] = useState<
    'unbeaten_level_desc' | 'unbeaten_level_asc' | 'beaten_first' | 'name_asc'
  >('unbeaten_level_desc');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [guildToEdit, setGuildToEdit] = useState<GuildRaidItem | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const [firebaseConfig, setFirebaseConfig] = useState<FirebaseConnectionConfig | null>(() => {
    const saved = localStorage.getItem('kkop_firebase_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  // Update countdown clock every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCycleInfo(calculateWednesdayCycleInfo());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Save guilds to localStorage
  const saveGuilds = useCallback((newGuilds: GuildRaidItem[]) => {
    setGuilds(newGuilds);
    localStorage.setItem('kkop_guild_items', JSON.stringify(newGuilds));
  }, []);

  // Auto Reset for Wednesday 05:00 AM (UTC+7)
  const performReset = useCallback(
    (newCycleKey: string, isManual = false) => {
      const resetGuilds = guilds.map(g => ({
        ...g,
        status: 'unbeaten' as const,
        beatenAt: null,
        updatedAt: Date.now(),
      }));

      setActiveCycleKey(newCycleKey);
      localStorage.setItem('kkop_active_cycle_key', newCycleKey);
      saveGuilds(resetGuilds);

      addToast(
        isManual
          ? 'รีเซ็ตสถานะเป็น "ยังไม่ได้ตี" ทุกกิลด์ด้วยตนเองเรียบร้อย!'
          : 'ระบบได้ทำการรีเซ็ตสถานะเรดกิลด์ประจำสัปดาห์อัตโนมัติ (วันพุธ 05:00 น.) แล้ว!',
        'success'
      );
    },
    [guilds, saveGuilds, addToast]
  );

  // Check cycle change
  useEffect(() => {
    const currentKey = cycleInfo.cycleKey;
    if (activeCycleKey && activeCycleKey !== currentKey) {
      performReset(currentKey, false);
    } else if (!activeCycleKey) {
      setActiveCycleKey(currentKey);
      localStorage.setItem('kkop_active_cycle_key', currentKey);
    }
  }, [cycleInfo.cycleKey, activeCycleKey, performReset]);

  // Keyboard shortcut Ctrl+V for quick add guild
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        // If not actively typing inside input or textarea
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag !== 'input' && activeTag !== 'textarea') {
          e.preventDefault();
          handleQuickPaste();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [guilds]);

  const handleQuickPaste = () => {
    const input = prompt('พิมพ์หรือวางชื่อกิลด์ที่ต้องการเพิ่ม (สามารถใส่หลายชื่อคั่นด้วยเครื่องหมายจุลภาค , หรือบรรทัดใหม่):');
    if (!input || !input.trim()) return;

    const names = input
      .split(/[,\n]/)
      .map(s => s.trim().toUpperCase())
      .filter(Boolean);

    if (names.length === 0) return;

    const icons: Array<GuildRaidItem['avatarIcon']> = ['dragon', 'lion', 'crows', 'devil', 'phoenix', 'wolf'];
    const newItems: GuildRaidItem[] = names.map((name, i) => ({
      id: 'g_' + Date.now() + '_' + i + '_' + Math.random().toString(36).substring(2, 5),
      name,
      level: 12,
      status: 'unbeaten',
      dropType: 'inventory',
      avatarIcon: icons[i % icons.length],
      updatedAt: Date.now(),
    }));

    saveGuilds([...guilds, ...newItems]);
    addToast(`เพิ่มกิลด์สำเร็จ ${newItems.length} รายการ`, 'success');
  };

  // Toggle Beaten status
  const handleToggleStatus = (id: string) => {
    const updated = guilds.map(g => {
      if (g.id === id) {
        const nextStatus = g.status === 'beaten' ? ('unbeaten' as const) : ('beaten' as const);
        return {
          ...g,
          status: nextStatus,
          beatenAt: nextStatus === 'beaten' ? Date.now() : null,
          updatedAt: Date.now(),
        };
      }
      return g;
    });
    saveGuilds(updated);
  };

  const handleOpenEdit = (guild: GuildRaidItem) => {
    setGuildToEdit(guild);
    setIsAddModalOpen(true);
  };

  const handleDelete = (id: string) => {
    const target = guilds.find(g => g.id === id);
    if (!target) return;
    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบกิลด์ "${target.name}"?`)) {
      const updated = guilds.filter(g => g.id !== id);
      saveGuilds(updated);
      addToast(`ลบกิลด์ "${target.name}" เรียบร้อยแล้ว`, 'info');
    }
  };

  const handleSaveGuild = (
    data: Omit<GuildRaidItem, 'id' | 'updatedAt'> & { id?: string }
  ) => {
    if (data.id) {
      // Edit
      const updated = guilds.map(g =>
        g.id === data.id
          ? {
              ...g,
              name: data.name,
              level: data.level,
              status: data.status,
              dropType: data.dropType,
              dropNote: data.dropNote,
              avatarIcon: data.avatarIcon,
              note: data.note,
              beatenAt: data.beatenAt ?? g.beatenAt,
              updatedAt: Date.now(),
            }
          : g
      );
      saveGuilds(updated);
      addToast(`อัปเดตข้อมูล ${data.name} สำเร็จ`, 'success');
    } else {
      // Add
      const newGuild: GuildRaidItem = {
        id: 'g_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        name: data.name,
        level: data.level,
        status: data.status,
        dropType: data.dropType,
        dropNote: data.dropNote,
        avatarIcon: data.avatarIcon,
        note: data.note,
        beatenAt: data.beatenAt || null,
        updatedAt: Date.now(),
      };
      saveGuilds([...guilds, newGuild]);
      addToast(`เพิ่มกิลด์ "${data.name}" เรียบร้อยแล้ว`, 'success');
    }
  };

  const handleManualReset = () => {
    if (confirm('ต้องการรีเซ็ตสถานะเป็น "ยังไม่ได้ตี" ทุกกิลด์ทันทีหรือไม่? (แนะนำเมื่อขึ้นรอบวันพุธ 05:00 น.)')) {
      performReset(cycleInfo.cycleKey, true);
    }
  };

  const handleSaveFirebaseConfig = (config: FirebaseConnectionConfig) => {
    setFirebaseConfig(config);
    localStorage.setItem('kkop_firebase_config', JSON.stringify(config));
    setIsFirebaseConnected(true);
    addToast('บันทึกการเชื่อมต่อ Firebase KKop สำเร็จ!', 'success');
  };

  const handleResetDemoData = () => {
    saveGuilds(INITIAL_DEMO_GUILDS);
    addToast('รีเซ็ตเป็นข้อมูลตัวอย่างเริ่มต้นเรียบร้อย', 'info');
  };

  // Filtered and Sorted Guilds
  const filteredGuilds = useMemo(() => {
    let list = guilds.filter(g => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = g.name.toLowerCase().includes(q);
        const matchLevel = g.level !== null && String(g.level).includes(q);
        const matchDrop = g.dropType.toLowerCase().includes(q) || (g.dropNote || '').toLowerCase().includes(q);
        const matchNote = (g.note || '').toLowerCase().includes(q);
        if (!matchName && !matchLevel && !matchDrop && !matchNote) return false;
      }

      // Status
      if (statusFilter === 'unbeaten' && g.status !== 'unbeaten') return false;
      if (statusFilter === 'beaten' && g.status !== 'beaten') return false;

      // Drop
      if (dropFilter !== 'all' && g.dropType !== dropFilter) return false;

      return true;
    });

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'unbeaten_level_desc') {
        // Unbeaten first, then level high to low
        if (a.status !== b.status) {
          return a.status === 'unbeaten' ? -1 : 1;
        }
        return (b.level ?? 0) - (a.level ?? 0);
      }
      if (sortBy === 'unbeaten_level_asc') {
        if (a.status !== b.status) {
          return a.status === 'unbeaten' ? -1 : 1;
        }
        return (a.level ?? 0) - (b.level ?? 0);
      }
      if (sortBy === 'beaten_first') {
        if (a.status !== b.status) {
          return a.status === 'beaten' ? -1 : 1;
        }
        return (b.level ?? 0) - (a.level ?? 0);
      }
      if (sortBy === 'name_asc') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    return list;
  }, [guilds, searchQuery, statusFilter, dropFilter, sortBy]);

  const counts = useMemo(() => {
    return {
      total: guilds.length,
      unbeaten: guilds.filter(g => g.status === 'unbeaten').length,
      beaten: guilds.filter(g => g.status === 'beaten').length,
    };
  }, [guilds]);

  // Generate LINE/Discord summary
  const generateExportText = () => {
    let t = `🛡️ [สรุปสถานะเรดแคลน กิลด์รอง KKop]\n`;
    t += `📅 ${cycleInfo.dateLabel}\n`;
    t += `------------------------------------\n`;
    t += `⚔️ ตีแล้วเรียบร้อย: ${counts.beaten}/${counts.total} กิลด์\n`;
    t += `⏳ ยังไม่ได้ตี: ${counts.unbeaten} กิลด์\n`;
    t += `------------------------------------\n\n`;

    const unbeatenList = guilds.filter(g => g.status === 'unbeaten');
    if (unbeatenList.length > 0) {
      t += `⚠️ กิลด์ที่ยังไม่ได้ตี (${unbeatenList.length}):\n`;
      unbeatenList.forEach((g, i) => {
        const lvStr = g.level ? `Lv.${g.level}` : 'ไม่ระบุ Lv.';
        const dropStr = g.dropType === 'inventory' ? 'ของเข้าตัว' : g.dropType === 'guild' ? 'เข้ากิล' : `อื่นๆ (${g.dropNote || '-'})`;
        t += ` ${i + 1}. ${g.name} (${lvStr}) - ${dropStr}\n`;
      });
      t += `\n`;
    }

    const beatenList = guilds.filter(g => g.status === 'beaten');
    if (beatenList.length > 0) {
      t += `✅ กิลด์ที่ตีแล้ว (${beatenList.length}):\n`;
      beatenList.forEach(g => {
        t += ` • ${g.name} (${g.level ? `Lv.${g.level}` : 'ไม่ระบุ Lv.'})\n`;
      });
    }

    t += `\n⏰ รีเซ็ตรอบถัดไป: วันพุธ เวลา 05:00 น. (UTC+7)`;
    return t;
  };

  return (
    <div className="bg-[#080c16] text-slate-100 min-h-screen flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isFirebaseConnected={isFirebaseConnected}
        onOpenAddMember={() => {
          setGuildToEdit(null);
          setIsAddModalOpen(true);
        }}
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenFirebase={() => setIsFirebaseModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {activeTab === 'tracker' && (
          <>
            {/* Wednesday 05:00 AM Auto-Reset Countdown Banner */}
            <WednesdayBanner cycleInfo={cycleInfo} onManualReset={handleManualReset} />

            {/* Filter, Search & Controls Bar */}
            <GuildFiltersBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              dropFilter={dropFilter}
              setDropFilter={setDropFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
              counts={counts}
              onOpenAddModal={() => {
                setGuildToEdit(null);
                setIsAddModalOpen(true);
              }}
              onQuickPaste={handleQuickPaste}
            />

            {/* 2-Column Cards Grid matching screenshot */}
            {filteredGuilds.length === 0 ? (
              <div className="py-20 text-center text-slate-500 space-y-3 bg-[#0b101e] border border-slate-800/80 rounded-2xl">
                <UsersRound className="w-12 h-12 mx-auto text-slate-600" />
                <p className="text-sm font-medium">ไม่พบกิลด์ตามเงื่อนไขการค้นหาหรือตัวกรองที่เลือก</p>
                <button
                  onClick={() => {
                    setGuildToEdit(null);
                    setIsAddModalOpen(true);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  + เพิ่มกิลด์ใหม่
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredGuilds.map(guild => (
                  <GuildCard
                    key={guild.id}
                    item={guild}
                    onToggleStatus={handleToggleStatus}
                    onEdit={handleOpenEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'code' && <CodeViewer />}

        {activeTab === 'deploy' && <DeployGuide />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070a13] py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>KKop Guild Sub-Clan Raid Manager &bull; Realtime Database Sync</p>
          <p>รีเซ็ตสถานะเป็น "ยังไม่ได้ตี" ทุกวันพุธ เวลา 05:00 น. (UTC+7)</p>
        </div>
      </footer>

      {/* Add / Edit Guild Modal */}
      <AddGuildModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        guildToEdit={guildToEdit}
        onSave={handleSaveGuild}
      />

      {/* Export LINE / Discord Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e1424] border border-slate-800 rounded-2xl w-full max-w-lg p-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>สรุปสถานะเรดส่ง LINE / Discord</span>
              </h3>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <p className="text-xs text-slate-400">
                สามารถคัดลอกข้อความสรุปด้านล่างไปวางในกลุ่มกิลด์ได้ทันที:
              </p>
              <textarea
                readOnly
                rows={11}
                value={generateExportText()}
                className="w-full bg-[#070b14] border border-slate-800 rounded-lg p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500 resize-none selection:bg-indigo-500 selection:text-white"
              />
            </div>
            <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-800 pt-3">
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors cursor-pointer"
              >
                ปิด
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generateExportText()).then(() => {
                    addToast('คัดลอกข้อความสรุปเรียบร้อยแล้ว!', 'success');
                  });
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-md cursor-pointer"
              >
                คัดลอกข้อความ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Firebase Modal */}
      <FirebaseModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
        config={firebaseConfig}
        onSave={handleSaveFirebaseConfig}
        onResetDemoData={handleResetDemoData}
      />

      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border shadow-xl text-xs backdrop-blur-md pointer-events-auto transition-all duration-300 transform translate-y-0 opacity-100 ${
              toast.type === 'success'
                ? 'bg-[#0f172a] border-emerald-500/40 text-emerald-200'
                : toast.type === 'warning'
                ? 'bg-[#0f172a] border-amber-500/40 text-amber-200'
                : 'bg-[#0f172a] border-slate-700 text-slate-200'
            }`}
          >
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

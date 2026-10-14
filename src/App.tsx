/**
 * KKop Guild Sub-Clan Raid Tracker & Attendance System
 * High-fidelity recreation matching user's reference UI with Wednesday 05:00 AM Auto-Reset & Firebase Sync
 * Full support for changing pictures and pasting images directly via Ctrl+V or Drag-and-Drop
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { WednesdayBanner } from './components/WednesdayBanner';
import { GuildFiltersBar } from './components/GuildFiltersBar';
import { GuildCard } from './components/GuildCard';
import { AddGuildModal } from './components/AddGuildModal';
import { ChangePictureModal } from './components/ChangePictureModal';
import { QuickPasteImageModal } from './components/QuickPasteImageModal';
import { FirebaseModal } from './components/FirebaseModal';
import { AiRaidCheckModal } from './components/AiRaidCheckModal';
import { CodeViewer } from './components/CodeViewer';
import { DeployGuide } from './components/DeployGuide';
import { calculateWednesdayCycleInfo } from './utils/cycle';
import { processImageFile } from './utils/image';
import { GuildRaidItem, DropType, WeeklyCycleInfo, FirebaseConnectionConfig } from './types';
import { UsersRound, Share2, Copy, Check, X, Camera, Sparkles, Plus } from 'lucide-react';
import {
  subscribeToFirestore,
  syncAllGuildsToFirestore,
  deleteGuildFromFirestore,
  syncCycleKeyToFirestore,
} from './services/firestoreSync';

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

  // Picture Modals
  const [hoveredGuildId, setHoveredGuildId] = useState<string | null>(null);
  const [selectedGuildForPicture, setSelectedGuildForPicture] = useState<GuildRaidItem | null>(null);
  const [isChangePictureModalOpen, setIsChangePictureModalOpen] = useState(false);
  const [isQuickPasteImageModalOpen, setIsQuickPasteImageModalOpen] = useState(false);
  const [pastedImageForModal, setPastedImageForModal] = useState<string>('');

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [isAiCheckModalOpen, setIsAiCheckModalOpen] = useState(false);
  const [aiCheckInitialImage, setAiCheckInitialImage] = useState<string>('');
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
    }, 4000);
  }, []);

  // Update countdown clock every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCycleInfo(calculateWednesdayCycleInfo());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const [isServerSyncConnected, setIsServerSyncConnected] = useState(false);

  // Sync with Firebase Firestore in Real-time (everyone connects without login/permission)
  useEffect(() => {
    const unsubscribe = subscribeToFirestore(
      (remoteGuilds) => {
        if (remoteGuilds && remoteGuilds.length > 0) {
          setGuilds(remoteGuilds);
          localStorage.setItem('kkop_guild_items', JSON.stringify(remoteGuilds));
        }
      },
      (remoteCycleKey) => {
        if (remoteCycleKey) {
          setActiveCycleKey(remoteCycleKey);
          localStorage.setItem('kkop_active_cycle_key', remoteCycleKey);
        }
      },
      (connected) => {
        setIsFirebaseConnected(connected);
      },
      INITIAL_DEMO_GUILDS
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Sync with Server via Server-Sent Events (SSE) as instant relay
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events');

      eventSource.onopen = () => {
        setIsServerSyncConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload && payload.data && Array.isArray(payload.data.guilds)) {
            setGuilds(payload.data.guilds);
            localStorage.setItem('kkop_guild_items', JSON.stringify(payload.data.guilds));
            if (payload.data.currentCycle) {
              setActiveCycleKey(payload.data.currentCycle);
              localStorage.setItem('kkop_active_cycle_key', payload.data.currentCycle);
            }
            if (payload.type === 'RESET') {
              addToast(
                payload.autoReset
                  ? 'ระบบรีเซ็ตสถานะเรดอัตโนมัติประจำสัปดาห์ (วันพุธ 05:00 น.) แล้ว!'
                  : 'สถานะเรดถูกรีเซ็ตเป็น "ยังไม่ได้ตี" ทุกกิลด์แล้ว!',
                'info'
              );
            }
          }
        } catch (e) {
          console.error('Failed to parse SSE event:', e);
        }
      };

      eventSource.onerror = () => {
        setIsServerSyncConnected(false);
      };
    } catch (e) {
      console.warn('SSE not connected, working in local mode:', e);
    }

    // Initial fetch to get latest shared guilds from server
    fetch('/api/guilds')
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data && Array.isArray(json.data.guilds)) {
          setGuilds(json.data.guilds);
          localStorage.setItem('kkop_guild_items', JSON.stringify(json.data.guilds));
          if (json.data.currentCycle) {
            setActiveCycleKey(json.data.currentCycle);
            localStorage.setItem('kkop_active_cycle_key', json.data.currentCycle);
          }
          setIsServerSyncConnected(true);
        }
      })
      .catch(() => {
        // Fallback to local storage
      });

    return () => {
      eventSource?.close();
    };
  }, [addToast]);

  // Save guilds: updates local state + Firebase Firestore + broadcasts to all connected members!
  const saveGuilds = useCallback((newGuilds: GuildRaidItem[]) => {
    setGuilds(newGuilds);
    localStorage.setItem('kkop_guild_items', JSON.stringify(newGuilds));

    // Real-time sync to Firebase Firestore
    syncAllGuildsToFirestore(newGuilds).catch(err => {
      console.warn('Firestore sync note:', err);
    });

    // Send update to server so all members see it in real-time
    fetch('/api/guilds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guilds: newGuilds }),
    }).catch(err => {
      console.warn('Server sync offline, saved to localStorage & Firebase:', err);
    });
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
      syncCycleKeyToFirestore(newCycleKey, resetGuilds).catch(console.error);

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

  // Global Paste Handler for Images (Ctrl + V)
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      // If modal is actively open and handling paste itself, let modal handle it
      if (isChangePictureModalOpen || isAddModalOpen) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      let imageFile: File | null = null;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          imageFile = items[i].getAsFile();
          break;
        }
      }

      if (imageFile) {
        e.preventDefault();
        try {
          const base64 = await processImageFile(imageFile);

          // If a specific guild is hovered by mouse
          if (hoveredGuildId) {
            const target = guilds.find(g => g.id === hoveredGuildId);
            if (target) {
              const updated = guilds.map(g =>
                g.id === hoveredGuildId
                  ? { ...g, customImage: base64, updatedAt: Date.now() }
                  : g
              );
              saveGuilds(updated);
              addToast(`เปลี่ยนรูปภาพของกิลด์ "${target.name}" สำเร็จแล้ว! 🎉 (จาก Ctrl+V)`, 'success');
              return;
            }
          }

          // If no specific guild hovered, open QuickPasteImageModal so user can select
          setPastedImageForModal(base64);
          setIsQuickPasteImageModalOpen(true);
        } catch (err) {
          console.error('Error handling pasted image:', err);
          addToast('เกิดข้อผิดพลาดในการประมวลผลรูปภาพที่วาง', 'warning');
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [
    guilds,
    hoveredGuildId,
    isChangePictureModalOpen,
    isAddModalOpen,
    saveGuilds,
    addToast,
  ]);

  // Handle changing picture from modal
  const handleOpenChangePicture = (guild: GuildRaidItem) => {
    setSelectedGuildForPicture(guild);
    setIsChangePictureModalOpen(true);
  };

  const handleSaveGuildImage = (guildId: string, customImage: string | null | undefined) => {
    const target = guilds.find(g => g.id === guildId);
    const cleanImage = customImage || null;
    const updated = guilds.map(g =>
      g.id === guildId ? { ...g, customImage: cleanImage, updatedAt: Date.now() } : g
    );
    saveGuilds(updated);
    addToast(
      cleanImage
        ? `อัปเดตรูปภาพของกิลด์ "${target?.name || ''}" สำเร็จ!`
        : `คืนค่าสัญลักษณ์เริ่มต้นของกิลด์ "${target?.name || ''}" แล้ว`,
      'success'
    );
  };

  const handleDropImage = (guildId: string, imageBase64: string) => {
    const target = guilds.find(g => g.id === guildId);
    const updated = guilds.map(g =>
      g.id === guildId ? { ...g, customImage: imageBase64, updatedAt: Date.now() } : g
    );
    saveGuilds(updated);
    addToast(`เปลี่ยนรูปภาพของกิลด์ "${target?.name || ''}" สำเร็จแล้ว! 📸`, 'success');
  };

  // Quick paste modal actions
  const handleApplyPastedImageToGuild = (guildId: string, image: string) => {
    const target = guilds.find(g => g.id === guildId);
    const updated = guilds.map(g =>
      g.id === guildId ? { ...g, customImage: image, updatedAt: Date.now() } : g
    );
    saveGuilds(updated);
    setIsQuickPasteImageModalOpen(false);
    addToast(`เปลี่ยนรูปภาพของกิลด์ "${target?.name || ''}" เรียบร้อย! 🎉`, 'success');
  };

  const handleCreateNewWithImage = (image: string) => {
    setIsQuickPasteImageModalOpen(false);
    setGuildToEdit({
      id: '',
      name: '',
      level: 12,
      status: 'unbeaten',
      dropType: 'inventory',
      avatarIcon: 'dragon',
      customImage: image,
      updatedAt: Date.now(),
    });
    setIsAddModalOpen(true);
  };

  // When clicking the "เปลี่ยนรูป (Ctrl+V)" button in filter bar
  const handlePasteImageButtonClick = () => {
    if (guilds.length > 0) {
      // Open change picture modal for the first guild or active guild
      const target = hoveredGuildId ? guilds.find(g => g.id === hoveredGuildId) : guilds[0];
      if (target) {
        handleOpenChangePicture(target);
      }
    } else {
      setIsAddModalOpen(true);
    }
  };

  // AI Vision Raid Check Modal Handlers
  const handleOpenAiRaidCheck = (initialImg?: string) => {
    setAiCheckInitialImage(initialImg || '');
    setIsAiCheckModalOpen(true);
  };

  const handleApplyAiStatuses = (updates: { guildId: string; status: 'beaten' | 'unbeaten' }[]) => {
    const updated = guilds.map(g => {
      const match = updates.find(u => u.guildId === g.id);
      if (match) {
        return {
          ...g,
          status: match.status,
          beatenAt: match.status === 'beaten' ? (g.beatenAt || Date.now()) : null,
          updatedAt: Date.now(),
        };
      }
      return g;
    });

    saveGuilds(updated);
    addToast(`อัปเดตสถานะเรดให้ ${updates.length} กิลด์ตามที่ AI ตรวจพบในรูปแล้ว! 🎉`, 'success');
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
      deleteGuildFromFirestore(id).catch(console.error);
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
              level: data.level != null ? Number(data.level) : null,
              status: data.status,
              dropType: data.dropType,
              dropNote: data.dropNote ?? null,
              avatarIcon: data.avatarIcon,
              customImage: data.customImage ?? null,
              note: data.note ?? null,
              beatenAt: data.beatenAt ?? g.beatenAt ?? null,
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
        level: data.level != null ? Number(data.level) : null,
        status: data.status,
        dropType: data.dropType,
        dropNote: data.dropNote ?? null,
        avatarIcon: data.avatarIcon,
        customImage: data.customImage ?? null,
        note: data.note ?? null,
        beatenAt: data.beatenAt ?? null,
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

    const unbeaten = guilds.filter(g => g.status === 'unbeaten');
    if (unbeaten.length > 0) {
      t += `📌 กิลด์ที่ยังไม่ได้ตี:\n`;
      unbeaten.forEach((g, i) => {
        t += `${i + 1}. ${g.name} (${g.level ? `Lv.${g.level}` : 'ไม่ระบุเลเวล'}) - ${
          g.dropType === 'inventory' ? 'ของเข้าตัว' : g.dropType === 'guild' ? 'เข้ากิล' : `อื่นๆ: ${g.dropNote || ''}`
        }\n`;
      });
    } else {
      t += `🎉 ยอดเยี่ยม! สมาชิกตีครบทุกกิลด์แล้ว 🎉\n`;
    }

    t += `\n⏰ รีเซ็ตรอบถัดไป: วันพุธ เวลา 05:00 น. (UTC+7)`;
    return t;
  };

  const [copiedText, setCopiedText] = useState(false);

  return (
    <div className="bg-[#080c16] text-slate-100 min-h-screen flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isFirebaseConnected={isFirebaseConnected}
        isServerSyncConnected={isServerSyncConnected}
        onOpenAddMember={() => {
          setGuildToEdit(null);
          setIsAddModalOpen(true);
        }}
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenFirebase={() => setIsFirebaseModalOpen(true)}
        onCopyShareLink={() => {
          navigator.clipboard.writeText(window.location.href);
          addToast('คัดลอกลิงก์สำเร็จ! ส่งให้สมาชิกในกิลด์เข้าใช้งานได้ทันที ไม่ต้องขออนุญาต', 'success');
        }}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {activeTab === 'tracker' && (
          <>
            {/* Real-time Shared Link Banner */}
            <div className="p-3.5 bg-gradient-to-r from-emerald-950/70 via-[#0a1828] to-indigo-950/70 border border-emerald-500/40 rounded-2xl flex items-center justify-between gap-3 text-xs flex-wrap shadow-lg shadow-emerald-950/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/30">
                  <UsersRound className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>ทุกคนเข้าได้ทันที ไม่ต้องขออนุญาต &bull; ข้อมูลซิงค์ตรงกันทุกคนแบบเรียลไทม์</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-slate-300 mt-0.5">
                    ส่งลิงก์นี้ให้สมาชิกกิลด์ ทุกคนสามารถกดติ๊กสถานะเรด หรือเปลี่ยนรูป แล้วเห็นอัปเดตตรงกันทันทีพร้อมกันทุกคน
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  addToast('คัดลอกลิงก์สำเร็จ! ส่งให้สมาชิกกิลด์เข้าใช้งานได้ทันที', 'success');
                }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-600/20 shrink-0"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>คัดลอกลิงก์ส่งกลุ่มกิลด์</span>
              </button>
            </div>

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
              onPasteImageClick={handlePasteImageButtonClick}
              onOpenAiRaidCheck={() => handleOpenAiRaidCheck()}
              onImageDroppedOrPasted={img => handleOpenAiRaidCheck(img)}
            />

            {/* Instruction Banner for Adding Guild and Pasting Images */}
            <div className="p-3.5 bg-gradient-to-r from-indigo-950/70 via-[#0e162d] to-purple-950/50 border border-indigo-500/40 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs shadow-md">
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-xl text-indigo-400 shrink-0 mt-0.5 sm:mt-0">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-amber-300 text-xs sm:text-sm">
                      📌 ให้ส่งหน้านี้มาสำหรับเพิ่มกิลด์: เมนู "แคลน" ➔ "ข้อมูลแคลน"
                    </span>
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-medium">
                      AI อ่านรูป & ดึงข้อมูลอัตโนมัติ
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    แคปหน้าจอเกมจากหน้า <strong>"ข้อมูลแคลน"</strong> แล้วกด <kbd className="bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-[10px] font-mono text-indigo-300 shadow-xs">Ctrl + V</kbd> หรือคลิก <strong>"+ เพิ่มกิลด์ใหม่"</strong> ระบบจะอ่านและลงข้อมูล 3 อย่างให้ทันที: <span className="text-indigo-200 font-semibold">❶ รูปตรากิลด์ (ตัดตราให้)</span> &bull; <span className="text-indigo-200 font-semibold">❷ ชื่อกิลด์</span> &bull; <span className="text-indigo-200 font-semibold">❸ เลเวลกิลด์</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  onClick={() => {
                    setGuildToEdit(null);
                    setIsAddModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่มกิลด์</span>
                </button>
                <button
                  onClick={handlePasteImageButtonClick}
                  className="px-3 py-1.5 bg-[#0a0f1d] hover:bg-slate-800 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-medium cursor-pointer"
                >
                  ดูตัวอย่าง
                </button>
              </div>
            </div>

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
                    isSelected={hoveredGuildId === guild.id}
                    onToggleStatus={handleToggleStatus}
                    onEdit={handleOpenEdit}
                    onDelete={handleDelete}
                    onChangePicture={handleOpenChangePicture}
                    onDropImage={handleDropImage}
                    onMouseEnter={() => setHoveredGuildId(guild.id)}
                    onMouseLeave={() => setHoveredGuildId(prev => (prev === guild.id ? null : prev))}
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

      {/* Change Picture Modal (Dedicated) */}
      <ChangePictureModal
        isOpen={isChangePictureModalOpen}
        onClose={() => {
          setIsChangePictureModalOpen(false);
          setSelectedGuildForPicture(null);
        }}
        guild={selectedGuildForPicture}
        onSaveImage={handleSaveGuildImage}
      />

      {/* Quick Paste Image Modal (When Ctrl+V pressed globally without hovering) */}
      <QuickPasteImageModal
        isOpen={isQuickPasteImageModalOpen}
        onClose={() => setIsQuickPasteImageModalOpen(false)}
        pastedImage={pastedImageForModal}
        guilds={guilds}
        onApplyToGuild={handleApplyPastedImageToGuild}
        onCreateNewWithImage={handleCreateNewWithImage}
      />

      {/* Export LINE / Discord Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e1424] border border-slate-800 rounded-2xl w-full max-w-lg p-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">สรุปรายงานส่งไลน์ / Discord</h3>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4">
              <textarea
                readOnly
                rows={12}
                value={generateExportText()}
                className="w-full bg-[#080d18] border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none"
              />
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generateExportText());
                  setCopiedText(true);
                  setTimeout(() => setCopiedText(false), 2000);
                  addToast('คัดลอกข้อความสรุปแล้ว นำไปวางใน LINE หรือ Discord ได้เลย!', 'success');
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                {copiedText ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedText ? 'คัดลอกเรียบร้อย' : 'คัดลอกข้อความ'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Firebase Config Modal */}
      <FirebaseModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
        config={firebaseConfig}
        onSave={handleSaveFirebaseConfig}
        onResetDemoData={() => {
          saveGuilds(INITIAL_DEMO_GUILDS);
          addToast('รีเซ็ตข้อมูลตัวอย่างเริ่มต้นเรียบร้อย', 'info');
        }}
      />

      {/* AI Vision Raid Check Modal (เช็คว่ากิลไหนลงไปแล้วจากรูป) */}
      <AiRaidCheckModal
        isOpen={isAiCheckModalOpen}
        onClose={() => setIsAiCheckModalOpen(false)}
        guilds={guilds}
        onApplyStatuses={handleApplyAiStatuses}
        onSetSearchQuery={setSearchQuery}
        initialImage={aiCheckInitialImage}
      />

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-xl shadow-xl text-xs font-medium border flex items-center gap-2 pointer-events-auto transition-all ${
              toast.type === 'success'
                ? 'bg-emerald-950/95 text-emerald-200 border-emerald-500/40'
                : toast.type === 'warning'
                ? 'bg-amber-950/95 text-amber-200 border-amber-500/40'
                : 'bg-slate-900/95 text-slate-200 border-slate-700'
            }`}
          >
            {toast.type === 'success' && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toast.type === 'warning' && <Camera className="w-4 h-4 text-amber-400 shrink-0" />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

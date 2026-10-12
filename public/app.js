/**
 * KKop Guild Sub-Clan Raid Tracker & Attendance System
 * Realtime Database Sync & Wednesday 05:00 AM (UTC+7) Auto Reset Logic
 * Supports changing pictures via Ctrl+V paste, drag & drop, and file upload
 */

const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "",
  authDomain: "kkop-guild.firebaseapp.com",
  databaseURL: "https://kkop-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "kkop-guild",
  storageBucket: "kkop-guild.appspot.com"
};

const INITIAL_DEMO_GUILDS = [
  { id: "g1", name: "SOLOLEVELING", level: 12, status: "unbeaten", dropType: "inventory", avatarIcon: "dragon", updatedAt: Date.now() },
  { id: "g2", name: "THAILAND", level: 12, status: "unbeaten", dropType: "inventory", avatarIcon: "lion", updatedAt: Date.now() },
  { id: "g3", name: "Crows", level: 10, status: "beaten", dropType: "inventory", avatarIcon: "crows", beatenAt: Date.now() - 3600000, updatedAt: Date.now() },
  { id: "g4", name: "DMTH", level: null, status: "beaten", dropType: "other", dropNote: "คนอื่นตี", avatarIcon: "devil", beatenAt: Date.now() - 7200000, updatedAt: Date.now() }
];

let firebaseApp = null;
let firebaseDb = null;
let dbRef = null;
let isFirebaseConnected = false;

let state = {
  guilds: [],
  currentCycle: "",
  lastResetTime: null,
  statusFilter: "all",
  dropFilter: "all",
  searchQuery: "",
  sortBy: "unbeaten_level_desc",
  firebaseConfig: null,
  hoveredGuildId: null,
  activeCpGuildId: null,
  tempCpImage: null,
  activeQpImage: null
};

// ==========================================
// WEDNESDAY 05:00 AM (UTC+7) CYCLE LOGIC
// ==========================================

function getWednesdayCycleInfo(baseDate = new Date()) {
  const utc = baseDate.getTime() + (baseDate.getTimezoneOffset() * 60000);
  const thaiNow = new Date(utc + (7 * 3600000));

  const dayOfWeek = thaiNow.getDay(); // 0 = Sun, 3 = Wed
  const hours = thaiNow.getHours();

  let daysSinceWedReset = 0;
  if (dayOfWeek === 3) {
    daysSinceWedReset = hours >= 5 ? 0 : 7;
  } else if (dayOfWeek > 3) {
    daysSinceWedReset = dayOfWeek - 3;
  } else {
    daysSinceWedReset = dayOfWeek + 4;
  }

  const cycleStartThai = new Date(thaiNow);
  cycleStartThai.setDate(thaiNow.getDate() - daysSinceWedReset);
  cycleStartThai.setHours(5, 0, 0, 0);

  const nextResetThai = new Date(cycleStartThai);
  nextResetThai.setDate(cycleStartThai.getDate() + 7);

  const msRemaining = Math.max(0, nextResetThai.getTime() - thaiNow.getTime());

  const y = cycleStartThai.getFullYear();
  const m = String(cycleStartThai.getMonth() + 1).padStart(2, '0');
  const d = String(cycleStartThai.getDate()).padStart(2, '0');
  const cycleKey = `CYCLE_${y}_${m}_${d}_0500`;

  return { cycleKey, cycleStartThai, nextResetThai, msRemaining };
}

function formatCycleDateString(dateObj) {
  const d = dateObj.getDate();
  const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const m = months[dateObj.getMonth()];
  const y = dateObj.getFullYear() + 543;
  return `รอบวันพุธที่ ${d} ${m} ${y} เวลา 05:00 น.`;
}

// ==========================================
// INITIALIZATION & FIREBASE CONNECTION
// ==========================================

function initApp() {
  loadSavedFirebaseConfig();
  setupFirebaseOrFallback();
  setupEventListeners();
  renderIconPicker();
  startCountdownTimer();

  // Check every 10s for Wednesday 05:00 AM reset
  setInterval(checkAndTriggerWeeklyReset, 10000);
}

function loadSavedFirebaseConfig() {
  const saved = localStorage.getItem("kkop_firebase_config");
  if (saved) {
    try { state.firebaseConfig = JSON.parse(saved); } catch (e) {}
  }
}

function setupFirebaseOrFallback() {
  // First check if server API is available
  fetch("/api/guilds")
    .then(r => r.json())
    .then(res => {
      if (res && res.success && res.data) {
        state.guilds = res.data.guilds || INITIAL_DEMO_GUILDS;
        state.currentCycle = res.data.currentCycle || "";
        state.lastResetTime = res.data.lastResetTime || null;
        updateSyncStatusUI(true, "เรียลไทม์ (Server Sync)");
        renderApp();
        setupServerSse();
        return;
      }
      setupFirebaseConnection();
    })
    .catch(() => {
      setupFirebaseConnection();
    });
}

function setupServerSse() {
  try {
    const es = new EventSource("/api/events");
    es.onopen = () => {
      updateSyncStatusUI(true, "เรียลไทม์ (Server Sync)");
    };
    es.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload && payload.data && Array.isArray(payload.data.guilds)) {
          state.guilds = payload.data.guilds;
          state.currentCycle = payload.data.currentCycle;
          state.lastResetTime = payload.data.lastResetTime;
          renderApp();
        }
      } catch (err) {}
    };
    es.onerror = () => {
      // If server disconnects, fallback to firebase check
      setupFirebaseConnection();
    };
  } catch (e) {
    setupFirebaseConnection();
  }
}

function setupFirebaseConnection() {
  const config = state.firebaseConfig || DEFAULT_FIREBASE_CONFIG;
  if (config && config.databaseURL && typeof firebase !== "undefined") {
    try {
      if (!firebase.apps.length) {
        firebaseApp = firebase.initializeApp(config);
      } else {
        firebaseApp = firebase.app();
      }

      firebaseDb = firebase.database();
      dbRef = firebaseDb.ref("guild_raid_data");

      // Test connection
      firebaseDb.ref(".info/connected").on("value", (snap) => {
        isFirebaseConnected = !!snap.val();
        updateSyncStatusUI(isFirebaseConnected, "เรียลไทม์ (Firebase)");
      });

      // Realtime listener
      dbRef.on("value", (snapshot) => {
        const val = snapshot.val();
        if (val && Array.isArray(val.guilds)) {
          state.guilds = val.guilds;
          state.currentCycle = val.current_cycle || "";
          state.lastResetTime = val.last_reset_time || null;
          renderApp();
          checkAndTriggerWeeklyReset();
        } else {
          initializeDefaultData();
        }
      }, (err) => {
        console.warn("Firebase permission or offline:", err);
        fallbackToLocalStorage();
      });

      return;
    } catch (e) {
      console.error("Firebase init failed:", e);
    }
  }

  fallbackToLocalStorage();
}

function fallbackToLocalStorage() {
  isFirebaseConnected = false;
  updateSyncStatusUI(false);

  const local = localStorage.getItem("kkop_guild_data");
  if (local) {
    try {
      const parsed = JSON.parse(local);
      state.guilds = parsed.guilds || INITIAL_DEMO_GUILDS;
      state.currentCycle = parsed.current_cycle || "";
      state.lastResetTime = parsed.last_reset_time || null;
    } catch (e) {
      state.guilds = INITIAL_DEMO_GUILDS;
    }
  } else {
    state.guilds = INITIAL_DEMO_GUILDS;
    const cycleInfo = getWednesdayCycleInfo();
    state.currentCycle = cycleInfo.cycleKey;
  }

  renderApp();
  checkAndTriggerWeeklyReset();
}

function initializeDefaultData() {
  const cycleInfo = getWednesdayCycleInfo();
  state.guilds = INITIAL_DEMO_GUILDS;
  state.currentCycle = cycleInfo.cycleKey;
  state.lastResetTime = Date.now();
  saveDataToDatabase();
}

function updateSyncStatusUI(connected) {
  const badge = document.getElementById("syncStatusBadge");
  const text = document.getElementById("syncStatusText");
  if (!badge || !text) return;

  if (connected) {
    badge.className = "inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
    badge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span><span>เรียลไทม์ (Firebase)</span>';
  } else {
    badge.className = "inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700";
    badge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span><span>ออฟไลน์ (Local)</span>';
  }
}

function saveDataToDatabase(updatedGuilds) {
  const guildsToSave = updatedGuilds || state.guilds;
  const payload = {
    current_cycle: state.currentCycle,
    last_reset_time: state.lastResetTime || Date.now(),
    guilds: guildsToSave
  };

  // Attempt server sync
  fetch("/api/guilds", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ guilds: guildsToSave })
  }).catch(() => {});

  if (isFirebaseConnected && dbRef) {
    dbRef.set(payload).catch(() => {
      localStorage.setItem("kkop_guild_data", JSON.stringify(payload));
    });
  } else {
    localStorage.setItem("kkop_guild_data", JSON.stringify(payload));
    state.guilds = guildsToSave;
    state.currentCycle = payload.current_cycle;
    state.lastResetTime = payload.last_reset_time;
    renderApp();
  }
}

function checkAndTriggerWeeklyReset() {
  const cycleInfo = getWednesdayCycleInfo();
  const currentKey = cycleInfo.cycleKey;

  if (state.currentCycle && state.currentCycle !== currentKey) {
    performReset(currentKey, false);
  } else if (!state.currentCycle) {
    state.currentCycle = currentKey;
    saveDataToDatabase();
  }
}

function performReset(newCycleKey, isManual = false) {
  const updatedGuilds = state.guilds.map(g => ({
    ...g,
    status: "unbeaten",
    beatenAt: null,
    updatedAt: Date.now()
  }));

  state.currentCycle = newCycleKey;
  state.lastResetTime = Date.now();
  state.guilds = updatedGuilds;
  saveDataToDatabase(updatedGuilds);

  showToast(
    isManual
      ? "รีเซ็ตสถานะเป็น \"ยังไม่ได้ตี\" ทุกกิลด์ด้วยตนเองเรียบร้อย!"
      : "ระบบรีเซ็ตสถานะเรดประจำสัปดาห์อัตโนมัติ (วันพุธ 05:00 น.) แล้ว!",
    "success"
  );
  renderApp();
}

// ==========================================
// COUNTDOWN TIMER
// ==========================================

function startCountdownTimer() {
  function tick() {
    const cycleInfo = getWednesdayCycleInfo();
    const ms = cycleInfo.msRemaining;
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    setText("countdownDays", String(days).padStart(2, "0"));
    setText("countdownHours", String(hours).padStart(2, "0"));
    setText("countdownMins", String(minutes).padStart(2, "0"));
    setText("countdownSecs", String(seconds).padStart(2, "0"));

    const cycleLabel = document.getElementById("currentCycleLabel");
    if (cycleLabel) {
      cycleLabel.textContent = `รอบปัจจุบัน: ${formatCycleDateString(cycleInfo.cycleStartThai)}`;
    }
  }

  tick();
  setInterval(tick, 1000);
}

// ==========================================
// RENDERING
// ==========================================

function renderApp() {
  updateCounts();
  renderGuildCards();
}

function updateCounts() {
  const total = state.guilds.length;
  const unbeaten = state.guilds.filter(g => g.status === "unbeaten").length;
  const beaten = state.guilds.filter(g => g.status === "beaten").length;

  setText("countTotal", total);
  setText("countUnbeaten", unbeaten);
  setText("countBeaten", beaten);
}

function getAvatarSvg(icon, customImage, guildId = null) {
  let content = "";
  if (customImage) {
    content = `<img src="${customImage}" alt="Emblem" class="w-full h-full object-cover rounded-[10px]">`;
  } else {
    switch (icon) {
      case 'dragon':
        content = `<div class="absolute inset-0 bg-gradient-to-tr from-red-600/20 via-transparent to-transparent pointer-events-none"></div><svg viewBox="0 0 24 24" fill="none" class="w-full h-full text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]" stroke="currentColor" stroke-width="1.8"><path d="M12 2C6.5 2 2 6.5 2 12c0 3.5 1.8 6.6 4.5 8.4-.2-1.8.4-3.7 1.8-5.1 1.7-1.7 4.2-2.1 6.3-1.1-.9-1.2-1.3-2.7-1.1-4.2.4-2.8 2.8-4.9 5.6-4.9 1.4 0 2.6.5 3.6 1.4-.4-3.7-3.5-6.5-7.7-6.5z" fill="currentColor" fill-opacity="0.85"/><circle cx="19" cy="10" r="1.5" fill="#fca5a5"/></svg>`;
        break;
      case 'lion':
        content = `<div class="absolute inset-0 bg-gradient-to-tr from-cyan-600/20 via-transparent to-transparent pointer-events-none"></div><svg viewBox="0 0 24 24" fill="none" class="w-full h-full text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]" stroke="currentColor" stroke-width="1.8"><path d="M12 3a9 9 0 0 0-9 9c0 3.8 2.4 7 5.8 8.3-.3-1.4.1-3 1.2-4.1 1.2-1.2 3-1.6 4.6-.9-.6-.9-.8-2-.6-3.1.3-2 1.9-3.5 3.9-3.5 1 0 1.8.3 2.5 1-.2-3.8-3.4-6.7-7.4-6.7z" fill="currentColor" fill-opacity="0.85"/><circle cx="16" cy="9" r="1.5" fill="#a5f3fc"/><path d="M8 14c1 1 2.5 1.5 4 1" stroke="#a5f3fc" stroke-width="2" stroke-linecap="round"/></svg>`;
        break;
      case 'crows':
        content = `<div class="absolute inset-0 bg-gradient-to-tr from-amber-600/20 via-transparent to-transparent pointer-events-none"></div><svg viewBox="0 0 24 24" fill="none" class="w-full h-full text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.7)]" stroke="currentColor" stroke-width="1.8"><path d="M12 2a5 5 0 0 0-5 5v3c0 2 1.5 3.5 3.5 4H8l-3 4h14l-3-4h-2.5c2-.5 3.5-2 3.5-4V7a5 5 0 0 0-5-5z" fill="currentColor" fill-opacity="0.85"/><circle cx="10" cy="7" r="1" fill="#fef3c7"/><circle cx="14" cy="7" r="1" fill="#fef3c7"/><path d="M9 18l3 4 3-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
        break;
      case 'devil':
        content = `<div class="absolute inset-0 bg-gradient-to-tr from-rose-600/20 via-transparent to-transparent pointer-events-none"></div><svg viewBox="0 0 24 24" fill="none" class="w-full h-full text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.7)]" stroke="currentColor" stroke-width="1.8"><path d="M4 6c0 5 3 13 8 16 5-3 8-11 8-16-3 1-6 0-8-2-2 2-5 3-8 2z" fill="currentColor" fill-opacity="0.85"/><path d="M9 11l2 2-2 2M15 11l-2 2 2 2" stroke="#ffe4e6" stroke-width="2" stroke-linecap="round"/><path d="M8 4l2 3M16 4l-2 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
        break;
      default:
        content = `<i class="fa-solid fa-shield text-indigo-400 text-xl"></i>`;
    }
  }

  if (guildId) {
    return `
      <div onclick="openChangePictureModal('${guildId}')" class="relative cursor-pointer group/avatar shrink-0" title="คลิกเพื่อเปลี่ยนรูป หรือชี้แล้วกด Ctrl+V เพื่อวางรูปภาพ">
        <div class="w-13 h-13 rounded-xl bg-[#121624] border border-indigo-500/40 p-0.5 shadow-md relative overflow-hidden flex items-center justify-center shrink-0 transition-transform group-hover/avatar:scale-105">
          ${content}
        </div>
        <div class="absolute inset-0 bg-slate-950/70 backdrop-blur-[1px] rounded-xl opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
          <i class="fa-solid fa-camera text-indigo-300 text-sm"></i>
          <span class="text-[9px] font-semibold text-indigo-200 mt-0.5 leading-none">Ctrl+V</span>
        </div>
        ${customImage ? '<div class="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full border-2 border-[#0b101d]"></div>' : ''}
      </div>
    `;
  }

  return `<div class="w-13 h-13 rounded-xl bg-[#121624] border border-indigo-500/40 p-0.5 shadow-md relative overflow-hidden flex items-center justify-center shrink-0">${content}</div>`;
}

function renderGuildCards() {
  const container = document.getElementById("guildCardsGrid");
  const emptyState = document.getElementById("emptyState");
  if (!container) return;

  let list = state.guilds.filter(g => {
    // Search
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase().trim();
      const matchName = g.name.toLowerCase().includes(q);
      const matchLevel = g.level !== null && String(g.level).includes(q);
      const matchDrop = (g.dropType || "").toLowerCase().includes(q) || (g.dropNote || "").toLowerCase().includes(q);
      if (!matchName && !matchLevel && !matchDrop) return false;
    }

    // Status filter
    if (state.statusFilter === "unbeaten" && g.status !== "unbeaten") return false;
    if (state.statusFilter === "beaten" && g.status !== "beaten") return false;

    // Drop filter
    if (state.dropFilter !== "all" && g.dropType !== state.dropFilter) return false;

    return true;
  });

  // Sorting
  list.sort((a, b) => {
    if (state.sortBy === "unbeaten_level_desc") {
      if (a.status !== b.status) return a.status === "unbeaten" ? -1 : 1;
      return (b.level ?? 0) - (a.level ?? 0);
    }
    if (state.sortBy === "unbeaten_level_asc") {
      if (a.status !== b.status) return a.status === "unbeaten" ? -1 : 1;
      return (a.level ?? 0) - (b.level ?? 0);
    }
    if (state.sortBy === "beaten_first") {
      if (a.status !== b.status) return a.status === "beaten" ? -1 : 1;
      return (b.level ?? 0) - (a.level ?? 0);
    }
    if (state.sortBy === "name_asc") {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  if (list.length === 0) {
    container.innerHTML = "";
    if (emptyState) emptyState.classList.remove("hidden");
    return;
  }
  if (emptyState) emptyState.classList.add("hidden");

  container.innerHTML = list.map(g => {
    const isBeaten = g.status === "beaten";

    // Drop badge HTML
    let dropHtml = "";
    if (g.dropType === "inventory") {
      dropHtml = `<span class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-medium"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span><span>1.ของเข้าตัว</span></span>`;
    } else if (g.dropType === "guild") {
      dropHtml = `<span class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-blue-950/60 text-blue-300 border border-blue-500/30 font-medium"><span class="w-1.5 h-1.5 rounded-full bg-blue-400"></span><span>2.เข้ากิล</span></span>`;
    } else {
      dropHtml = `<span class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-amber-950/60 text-amber-300 border border-amber-500/30 font-medium"><span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span><span>3.อื่นๆ: ${escapeHtml(g.dropNote || 'คนอื่นตี')}</span></span>`;
    }

    const cardClass = isBeaten
      ? "bg-[#0d1525] border border-emerald-500/40 shadow-lg shadow-emerald-950/20"
      : "bg-[#0b101d] border border-slate-800/80 hover:border-slate-700/80";

    const buttonClass = isBeaten
      ? "bg-[#059669] hover:bg-[#047857] text-white shadow-md shadow-emerald-950/40"
      : "bg-[#131b2e] hover:bg-[#1a253e] text-slate-300 border border-slate-800";

    const buttonContent = isBeaten
      ? `<i class="fa-solid fa-circle-check text-white"></i><span>ตีแล้วเรียบร้อย</span>`
      : `<i class="fa-regular fa-circle text-slate-400"></i><span>ยังไม่ได้ตี</span>`;

    return `
      <div
        onmouseenter="setHoveredGuild('${g.id}')"
        onmouseleave="clearHoveredGuild('${g.id}')"
        ondragover="event.preventDefault()"
        ondrop="handleCardDrop(event, '${g.id}')"
        class="rounded-2xl p-4 sm:p-5 transition-all duration-200 relative flex flex-col justify-between group ${cardClass}">
        <div>
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              ${getAvatarSvg(g.avatarIcon, g.customImage, g.id)}
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <h3 class="text-base sm:text-lg font-bold text-white tracking-wide uppercase font-chakra">
                    ${escapeHtml(g.name)}
                  </h3>
                  ${isBeaten ? '<span class="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">ตีแล้ว</span>' : ''}
                </div>
                <div class="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <div class="flex items-center gap-1">
                    <i class="fa-solid fa-user-group text-slate-500 text-[10px]"></i>
                    <span>${g.level ? `Lv.${g.level}` : 'ไม่ระบุเลเวล'}</span>
                  </div>
                  <button type="button" onclick="openChangePictureModal('${g.id}')" class="text-[11px] text-indigo-400 hover:text-indigo-300 underline opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 cursor-pointer">
                    <i class="fa-solid fa-camera text-[10px]"></i>
                    <span>เปลี่ยนรูป (Ctrl+V)</span>
                  </button>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-1">
              <button onclick="openChangePictureModal('${g.id}')" class="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer" title="เปลี่ยนรูปภาพ (Ctrl+V)">
                <i class="fa-solid fa-camera text-sm"></i>
              </button>
              <button onclick="openEditGuild('${g.id}')" class="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer" title="แก้ไข">
                <i class="fa-solid fa-pen text-sm"></i>
              </button>
            </div>
          </div>

          <div class="mt-3.5 flex items-center gap-2 flex-wrap">
            ${dropHtml}
          </div>
        </div>

        <div class="mt-5 flex items-center gap-2 pt-1">
          <button onclick="toggleGuildStatus('${g.id}')" class="flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${buttonClass}">
            ${buttonContent}
          </button>
          <button onclick="deleteGuild('${g.id}')" class="p-2.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer" title="ลบ">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
    `;
  }).join("");
}

// Hover tracking
window.setHoveredGuild = function(id) {
  state.hoveredGuildId = id;
};
window.clearHoveredGuild = function(id) {
  if (state.hoveredGuildId === id) state.hoveredGuildId = null;
};

// ==========================================
// IMAGE PROCESSING & CTRL+V PASTE
// ==========================================

function compressImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.85));
        } else {
          resolve(e.target.result);
        }
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Global Paste Listener
window.addEventListener("paste", async (e) => {
  const items = e.clipboardData?.items;
  if (!items) return;

  let imageFile = null;
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf("image") !== -1) {
      imageFile = items[i].getAsFile();
      break;
    }
  }

  if (imageFile) {
    e.preventDefault();
    try {
      const base64 = await compressImageFile(imageFile);

      // Case 1: Change Picture Modal is currently open
      const cpModal = document.getElementById("changePictureModal");
      if (cpModal && !cpModal.classList.contains("hidden") && state.activeCpGuildId) {
        setChangePicturePreview(base64);
        showToast("ตรวจพบรูปภาพจาก Ctrl+V พร้อมบันทึกแล้ว!", "success");
        return;
      }

      // Case 2: Add/Edit Guild Modal is currently open
      const gModal = document.getElementById("guildModal");
      if (gModal && !gModal.classList.contains("hidden")) {
        setCustomImagePreview(base64);
        showToast("วางรูปภาพลงในฟอร์มสำเร็จ!", "success");
        return;
      }

      // Case 3: A guild card is hovered by mouse
      if (state.hoveredGuildId) {
        const target = state.guilds.find(g => g.id === state.hoveredGuildId);
        if (target) {
          const updated = state.guilds.map(g =>
            g.id === state.hoveredGuildId ? { ...g, customImage: base64, updatedAt: Date.now() } : g
          );
          saveDataToDatabase(updated);
          showToast(`เปลี่ยนรูปภาพของกิลด์ "${target.name}" สำเร็จแล้ว! 🎉 (จาก Ctrl+V)`, "success");
          return;
        }
      }

      // Case 4: No specific guild hovered -> open QuickPasteModal to select guild
      openQuickPasteModal(base64);
    } catch (err) {
      console.error("Paste image error:", err);
      showToast("เกิดข้อผิดพลาดในการประมวลผลรูปภาพที่วาง", "warning");
    }
  }
});

// Drag & Drop on Guild Cards
window.handleCardDrop = async function(e, guildId) {
  e.preventDefault();
  const file = e.dataTransfer?.files?.[0];
  if (file && file.type.startsWith("image/")) {
    try {
      const base64 = await compressImageFile(file);
      const target = state.guilds.find(g => g.id === guildId);
      const updated = state.guilds.map(g =>
        g.id === guildId ? { ...g, customImage: base64, updatedAt: Date.now() } : g
      );
      saveDataToDatabase(updated);
      showToast(`เปลี่ยนรูปภาพของกิลด์ "${target?.name || ''}" สำเร็จแล้ว! 📸`, "success");
    } catch (err) {
      console.error("Card drop error:", err);
    }
  }
};

// ==========================================
// CHANGE PICTURE MODAL
// ==========================================

window.openChangePictureModal = function(guildId) {
  const g = state.guilds.find(x => x.id === guildId);
  if (!g) return;

  state.activeCpGuildId = guildId;
  state.tempCpImage = g.customImage || null;

  document.getElementById("cpGuildName").textContent = `เปลี่ยนรูปกิลด์: ${g.name}`;
  setChangePicturePreview(state.tempCpImage);

  document.getElementById("changePictureModal").classList.remove("hidden");
};

function closeChangePictureModal() {
  document.getElementById("changePictureModal").classList.add("hidden");
  state.activeCpGuildId = null;
  state.tempCpImage = null;
}

function setChangePicturePreview(base64) {
  state.tempCpImage = base64;
  const container = document.getElementById("cpCurrentPreview");
  const removeBtn = document.getElementById("cpRemoveBtnContainer");

  const target = state.guilds.find(g => g.id === state.activeCpGuildId);
  const icon = target?.avatarIcon || "dragon";

  if (base64) {
    container.innerHTML = `<img src="${base64}" alt="Preview" class="w-18 h-18 rounded-xl object-cover border border-indigo-500/50 shadow-md">`;
    if (removeBtn) removeBtn.classList.remove("hidden");
  } else {
    container.innerHTML = getAvatarSvg(icon);
    if (removeBtn) removeBtn.classList.add("hidden");
  }
}

// ==========================================
// QUICK PASTE IMAGE MODAL
// ==========================================

function openQuickPasteModal(base64) {
  state.activeQpImage = base64;
  const thumb = document.getElementById("qpImageThumbnail");
  if (thumb) {
    thumb.innerHTML = `<img src="${base64}" alt="Pasted" class="w-full h-full object-cover rounded-[10px]">`;
  }

  renderQuickPasteGuildList();
  document.getElementById("quickPasteImageModal").classList.remove("hidden");
}

function closeQuickPasteModal() {
  document.getElementById("quickPasteImageModal").classList.add("hidden");
  state.activeQpImage = null;
}

function renderQuickPasteGuildList(search = "") {
  const container = document.getElementById("qpGuildsList");
  if (!container) return;

  const filtered = state.guilds.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    (g.level && String(g.level).includes(search))
  );

  if (filtered.length === 0) {
    container.innerHTML = `<div class="text-center py-6 text-xs text-slate-500">ไม่พบกิลด์ที่ตรงกับคำค้นหา</div>`;
    return;
  }

  container.innerHTML = filtered.map(g => `
    <div onclick="applyQuickPasteToGuild('${g.id}')" class="flex items-center justify-between p-2.5 rounded-xl bg-[#090e1c] hover:bg-[#131b2f] border border-slate-800/80 hover:border-indigo-500/50 transition-all cursor-pointer group">
      <div class="flex items-center gap-3">
        ${getAvatarSvg(g.avatarIcon, g.customImage)}
        <div>
          <div class="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">${escapeHtml(g.name)}</div>
          <div class="text-[11px] text-slate-400">${g.level ? `Lv.${g.level}` : 'ไม่ระบุเลเวล'} • ${g.status === 'beaten' ? 'ตีแล้ว' : 'ยังไม่ได้ตี'}</div>
        </div>
      </div>
      <button type="button" class="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-950/70 text-indigo-300 border border-indigo-500/30 group-hover:bg-indigo-600 group-hover:text-white transition-all flex items-center gap-1.5">
        <i class="fa-solid fa-check text-xs"></i>
        <span>เปลี่ยนเป็นรูปนี้</span>
      </button>
    </div>
  `).join("");
}

window.applyQuickPasteToGuild = function(guildId) {
  if (!state.activeQpImage) return;
  const target = state.guilds.find(g => g.id === guildId);
  const updated = state.guilds.map(g =>
    g.id === guildId ? { ...g, customImage: state.activeQpImage, updatedAt: Date.now() } : g
  );
  saveDataToDatabase(updated);
  closeQuickPasteModal();
  showToast(`เปลี่ยนรูปภาพของกิลด์ "${target?.name || ''}" เรียบร้อย! 🎉`, "success");
};

// ==========================================
// ACTIONS & HANDLERS
// ==========================================

window.toggleGuildStatus = function(id) {
  const updated = state.guilds.map(g => {
    if (g.id === id) {
      const nextStatus = g.status === "beaten" ? "unbeaten" : "beaten";
      return {
        ...g,
        status: nextStatus,
        beatenAt: nextStatus === "beaten" ? Date.now() : null,
        updatedAt: Date.now()
      };
    }
    return g;
  });
  saveDataToDatabase(updated);
};

function setCustomImagePreview(base64) {
  const hiddenInput = document.getElementById("formCustomImage");
  const previewBox = document.getElementById("customImagePreviewBox");
  const label = document.getElementById("customImageLabel");
  const badge = document.getElementById("customImageBadge");
  const subtext = document.getElementById("customImageSubtext");
  const removeBtn = document.getElementById("btnRemoveCustomImage");

  if (hiddenInput) hiddenInput.value = base64 || "";

  if (base64) {
    if (previewBox) {
      previewBox.innerHTML = `<img src="${base64}" alt="Preview" class="w-full h-full object-cover rounded-[10px]">`;
      previewBox.className = "w-11 h-11 rounded-xl bg-slate-900 border border-indigo-500/50 p-0.5 shadow-md relative overflow-hidden shrink-0";
    }
    if (label) label.textContent = "ใช้รูปภาพที่วางเอง";
    if (badge) badge.classList.remove("hidden");
    if (subtext) subtext.textContent = "กด Ctrl+V อีกครั้งเพื่อเปลี่ยนรูปใหม่";
    if (removeBtn) removeBtn.classList.remove("hidden");
  } else {
    if (previewBox) {
      previewBox.innerHTML = '<i class="fa-regular fa-image text-indigo-400 text-lg"></i>';
      previewBox.className = "w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 shrink-0";
    }
    if (label) label.textContent = "เปลี่ยนรูป: กด Ctrl+V ได้ทันที";
    if (badge) badge.classList.add("hidden");
    if (subtext) subtext.textContent = "คัดลอกรูปภาพแล้วกด Ctrl+V หรือคลิกเลือกไฟล์";
    if (removeBtn) removeBtn.classList.add("hidden");
  }
}

window.openEditGuild = function(id) {
  const g = state.guilds.find(x => x.id === id);
  if (!g) return;

  document.getElementById("modalTitle").innerHTML = '<i class="fa-solid fa-pen text-indigo-400"></i> แก้ไขข้อมูลกิลด์';
  document.getElementById("formGuildId").value = g.id;
  document.getElementById("formGuildName").value = g.name;
  document.getElementById("formGuildIcon").value = g.avatarIcon || "dragon";

  if (g.level === null) {
    document.getElementById("formNoLevel").checked = true;
    document.getElementById("formGuildLevel").value = "";
  } else {
    document.getElementById("formNoLevel").checked = false;
    document.getElementById("formGuildLevel").value = g.level;
  }

  document.getElementById("formDropType").value = g.dropType;
  const noteEl = document.getElementById("formDropNote");
  if (g.dropType === "other") {
    noteEl.classList.remove("hidden");
    noteEl.value = g.dropNote || "";
  } else {
    noteEl.classList.add("hidden");
    noteEl.value = "";
  }

  document.getElementById("formStatus").value = g.status;
  setSelectedIcon(g.avatarIcon || "dragon");
  setCustomImagePreview(g.customImage || "");

  document.getElementById("guildModal").classList.remove("hidden");
};

window.deleteGuild = function(id) {
  const g = state.guilds.find(x => x.id === id);
  if (!g) return;

  if (confirm(`ต้องการลบกิลด์ "${g.name}" ใช่หรือไม่?`)) {
    const updated = state.guilds.filter(x => x.id !== id);
    saveDataToDatabase(updated);
    showToast(`ลบกิลด์ "${g.name}" เรียบร้อยแล้ว`, "info");
  }
};

function renderIconPicker() {
  const picker = document.getElementById("iconPicker");
  if (!picker) return;

  const icons = ['dragon', 'lion', 'crows', 'devil'];
  picker.innerHTML = icons.map(ic => `
    <button type="button" onclick="setSelectedIcon('${ic}')" data-icon="${ic}" class="icon-choice p-1.5 rounded-xl border border-slate-800 bg-[#0a0f1d] hover:border-slate-700 flex items-center justify-center transition-all cursor-pointer">
      ${getAvatarSvg(ic)}
    </button>
  `).join("");
}

window.setSelectedIcon = function(icon) {
  document.getElementById("formGuildIcon").value = icon;
  document.querySelectorAll(".icon-choice").forEach(btn => {
    if (btn.getAttribute("data-icon") === icon) {
      btn.className = "icon-choice p-1.5 rounded-xl border border-indigo-500 bg-indigo-950/50 scale-105 shadow-md flex items-center justify-center transition-all cursor-pointer";
    } else {
      btn.className = "icon-choice p-1.5 rounded-xl border border-slate-800 bg-[#0a0f1d] hover:border-slate-700 flex items-center justify-center transition-all cursor-pointer";
    }
  });
};

// ==========================================
// EVENT LISTENERS SETUP
// ==========================================

function setupEventListeners() {
  // Search
  document.getElementById("searchInput")?.addEventListener("input", (e) => {
    state.searchQuery = e.target.value;
    renderGuildCards();
  });

  // Status Tabs
  document.querySelectorAll(".status-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".status-tab").forEach(t => {
        t.className = "status-tab px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer";
      });
      tab.className = "status-tab active px-3 py-1.5 rounded-lg font-semibold bg-indigo-600 text-white shadow-sm transition-colors cursor-pointer";

      state.statusFilter = tab.getAttribute("data-status");
      renderGuildCards();
    });
  });

  // Drop Tabs
  document.querySelectorAll(".drop-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".drop-tab").forEach(t => {
        t.className = "drop-tab px-3 py-1.5 rounded-xl border bg-[#0c1220] text-slate-400 border-slate-800/80 hover:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer";
      });
      tab.className = "drop-tab active px-3 py-1.5 rounded-xl border bg-slate-800 text-white border-slate-600 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer";

      state.dropFilter = tab.getAttribute("data-drop");
      renderGuildCards();
    });
  });

  // Sort Select
  document.getElementById("sortSelect")?.addEventListener("change", (e) => {
    state.sortBy = e.target.value;
    renderGuildCards();
  });

  // Change Picture Button in top bar
  document.getElementById("btnQuickChangePicture")?.addEventListener("click", () => {
    if (state.guilds.length > 0) {
      const targetId = state.hoveredGuildId || state.guilds[0].id;
      openChangePictureModal(targetId);
    } else {
      openAddGuildHandler();
    }
  });

  // Manual Reset
  document.getElementById("btnManualReset")?.addEventListener("click", () => {
    if (confirm("ต้องการรีเซ็ตสถานะเป็น \"ยังไม่ได้ตี\" ทุกกิลด์ทันทีหรือไม่? (แนะนำเมื่อขึ้นรอบวันพุธ 05:00 น.)")) {
      const cycleInfo = getWednesdayCycleInfo();
      performReset(cycleInfo.cycleKey, true);
    }
  });

  // Open Add Guild Modal
  const openAddGuildHandler = () => {
    document.getElementById("modalTitle").innerHTML = '<i class="fa-solid fa-plus text-indigo-400"></i> เพิ่มกิลด์ใหม่';
    document.getElementById("guildForm").reset();
    document.getElementById("formGuildId").value = "";
    document.getElementById("formGuildLevel").value = "12";
    document.getElementById("formNoLevel").checked = false;
    document.getElementById("formDropNote").classList.add("hidden");
    setSelectedIcon("dragon");
    setCustomImagePreview("");
    document.getElementById("guildModal").classList.remove("hidden");
  };

  document.getElementById("btnOpenAddGuild")?.addEventListener("click", openAddGuildHandler);
  document.getElementById("btnEmptyAdd")?.addEventListener("click", openAddGuildHandler);

  // Close Guild Modal
  const closeGuildModal = () => document.getElementById("guildModal")?.classList.add("hidden");
  document.getElementById("btnCloseGuildModal")?.addEventListener("click", closeGuildModal);
  document.getElementById("btnCancelGuildModal")?.addEventListener("click", closeGuildModal);

  // File upload inside Add/Edit modal
  document.getElementById("btnTriggerUpload")?.addEventListener("click", () => {
    document.getElementById("formFileInput")?.click();
  });
  document.getElementById("formFileInput")?.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await compressImageFile(file);
      setCustomImagePreview(base64);
      showToast("อัปโหลดรูปภาพสำเร็จ!", "success");
    }
  });
  document.getElementById("btnRemoveCustomImage")?.addEventListener("click", () => {
    setCustomImagePreview("");
  });

  // Change Picture Modal Events
  document.getElementById("btnCloseChangePictureModal")?.addEventListener("click", closeChangePictureModal);
  document.getElementById("btnCancelChangePicture")?.addEventListener("click", closeChangePictureModal);

  document.getElementById("btnCpRemoveImage")?.addEventListener("click", () => {
    setChangePicturePreview(null);
  });

  const cpDropZone = document.getElementById("cpDropZone");
  const cpFileInput = document.getElementById("cpFileInput");

  cpDropZone?.addEventListener("click", () => cpFileInput?.click());

  cpFileInput?.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await compressImageFile(file);
      setChangePicturePreview(base64);
      showToast("เลือกรูปภาพสำเร็จ!", "success");
    }
  });

  cpDropZone?.addEventListener("dragover", (e) => {
    e.preventDefault();
    cpDropZone.classList.add("border-indigo-400", "bg-indigo-950/30");
  });
  cpDropZone?.addEventListener("dragleave", () => {
    cpDropZone.classList.remove("border-indigo-400", "bg-indigo-950/30");
  });
  cpDropZone?.addEventListener("drop", async (e) => {
    e.preventDefault();
    cpDropZone.classList.remove("border-indigo-400", "bg-indigo-950/30");
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const base64 = await compressImageFile(file);
      setChangePicturePreview(base64);
      showToast("วางรูปภาพสำเร็จ!", "success");
    }
  });

  document.getElementById("btnSaveChangePicture")?.addEventListener("click", () => {
    if (!state.activeCpGuildId) return;
    const target = state.guilds.find(g => g.id === state.activeCpGuildId);
    const updated = state.guilds.map(g =>
      g.id === state.activeCpGuildId ? { ...g, customImage: state.tempCpImage || undefined, updatedAt: Date.now() } : g
    );
    saveDataToDatabase(updated);
    closeChangePictureModal();
    showToast(`อัปเดตรูปภาพของ "${target?.name || ''}" สำเร็จแล้ว! 🎉`, "success");
  });

  // Quick Paste Modal Events
  document.getElementById("btnCloseQuickPasteModal")?.addEventListener("click", closeQuickPasteModal);
  document.getElementById("btnCancelQuickPaste")?.addEventListener("click", closeQuickPasteModal);
  document.getElementById("qpSearchInput")?.addEventListener("input", (e) => {
    renderQuickPasteGuildList(e.target.value);
  });

  // Drop type select toggle
  document.getElementById("formDropType")?.addEventListener("change", (e) => {
    const noteEl = document.getElementById("formDropNote");
    if (e.target.value === "other") {
      noteEl.classList.remove("hidden");
    } else {
      noteEl.classList.add("hidden");
    }
  });

  // Submit Guild Form
  document.getElementById("guildForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("formGuildId").value;
    const name = document.getElementById("formGuildName").value.trim().toUpperCase();
    const isNoLevel = document.getElementById("formNoLevel").checked;
    const level = isNoLevel ? null : (parseInt(document.getElementById("formGuildLevel").value, 10) || 1);
    const dropType = document.getElementById("formDropType").value;
    const dropNote = document.getElementById("formDropNote").value.trim();
    const status = document.getElementById("formStatus").value;
    const avatarIcon = document.getElementById("formGuildIcon").value || "dragon";
    const customImage = document.getElementById("formCustomImage").value || undefined;

    if (!name) return;

    let updated = [];
    if (id) {
      updated = state.guilds.map(g => g.id === id ? {
        ...g, name, level, dropType, dropNote: dropType === 'other' ? dropNote || 'คนอื่นตี' : undefined, status, avatarIcon, customImage, updatedAt: Date.now()
      } : g);
      showToast(`อัปเดตข้อมูล ${name} สำเร็จ`, "success");
    } else {
      const newGuild = {
        id: "g_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
        name,
        level,
        status,
        dropType,
        dropNote: dropType === 'other' ? dropNote || 'คนอื่นตี' : undefined,
        avatarIcon,
        customImage,
        updatedAt: Date.now()
      };
      updated = [...state.guilds, newGuild];
      showToast(`เพิ่มกิลด์ "${name}" สำเร็จ`, "success");
    }

    saveDataToDatabase(updated);
    closeGuildModal();
  });

  // Export LINE / Discord Modal
  document.getElementById("btnExportLine")?.addEventListener("click", () => {
    generateExportSummary();
    document.getElementById("exportModal")?.classList.remove("hidden");
  });
  document.getElementById("btnCloseExportModal")?.addEventListener("click", () => {
    document.getElementById("exportModal")?.classList.add("hidden");
  });
  document.getElementById("btnCopyExportText")?.addEventListener("click", () => {
    const text = document.getElementById("exportTextArea").value;
    navigator.clipboard.writeText(text);
    showToast("คัดลอกข้อความสรุปแล้ว นำไปวางใน LINE/Discord ได้เลย!", "success");
  });

  // Firebase Config Modal
  document.getElementById("btnOpenFirebaseModal")?.addEventListener("click", () => {
    const config = state.firebaseConfig || DEFAULT_FIREBASE_CONFIG;
    document.getElementById("fbConfigDbUrl").value = config.databaseURL || "";
    document.getElementById("fbConfigApiKey").value = config.apiKey || "";
    document.getElementById("fbConfigProjectId").value = config.projectId || "kkop-guild";
    document.getElementById("firebaseModal")?.classList.remove("hidden");
  });
  document.getElementById("btnCloseFirebaseModal")?.addEventListener("click", () => {
    document.getElementById("firebaseModal")?.classList.add("hidden");
  });
  document.getElementById("btnCancelFirebaseModal")?.addEventListener("click", () => {
    document.getElementById("firebaseModal")?.classList.add("hidden");
  });

  document.getElementById("btnSaveFirebaseConfig")?.addEventListener("click", () => {
    const dbUrl = document.getElementById("fbConfigDbUrl").value.trim();
    const apiKey = document.getElementById("fbConfigApiKey").value.trim();
    const projectId = document.getElementById("fbConfigProjectId").value.trim();

    if (!dbUrl) {
      alert("กรุณากรอก Realtime Database URL");
      return;
    }

    const newConfig = {
      apiKey: apiKey || "",
      authDomain: `${projectId}.firebaseapp.com`,
      databaseURL: dbUrl,
      projectId: projectId || "kkop-guild"
    };

    state.firebaseConfig = newConfig;
    localStorage.setItem("kkop_firebase_config", JSON.stringify(newConfig));
    document.getElementById("firebaseModal")?.classList.add("hidden");
    showToast("บันทึกการตั้งค่า Firebase สำเร็จ กำลังเชื่อมต่อ...", "info");
    setupFirebaseOrFallback();
  });

  document.getElementById("btnResetToDemoData")?.addEventListener("click", () => {
    if (confirm("ต้องการรีเซ็ตข้อมูลเป็นตัวอย่างเริ่มต้นหรือไม่?")) {
      saveDataToDatabase(INITIAL_DEMO_GUILDS);
      document.getElementById("firebaseModal")?.classList.add("hidden");
      showToast("รีเซ็ตเป็นข้อมูลตัวอย่างเริ่มต้นแล้ว", "success");
    }
  });
}

function generateExportSummary() {
  const cycleInfo = getWednesdayCycleInfo();
  const dateStr = formatCycleDateString(cycleInfo.cycleStartThai);
  const total = state.guilds.length;
  const unbeaten = state.guilds.filter(g => g.status === "unbeaten");
  const beaten = state.guilds.filter(g => g.status === "beaten");

  let text = `🛡️ [สรุปสถานะเรดแคลน กิลด์รอง KKop]\n`;
  text += `📅 ${dateStr}\n`;
  text += `------------------------------------\n`;
  text += `⚔️ ตีแล้วเรียบร้อย: ${beaten.length}/${total} กิลด์\n`;
  text += `⏳ ยังไม่ได้ตี: ${unbeaten.length} กิลด์\n`;
  text += `------------------------------------\n\n`;

  if (unbeaten.length > 0) {
    text += `⚠️ กิลด์ที่ยังไม่ได้ตี (${unbeaten.length}):\n`;
    unbeaten.forEach((g, idx) => {
      const lvStr = g.level ? `Lv.${g.level}` : 'ไม่ระบุ Lv.';
      const dropStr = g.dropType === 'inventory' ? 'ของเข้าตัว' : g.dropType === 'guild' ? 'เข้ากิล' : `อื่นๆ (${g.dropNote || '-'})`;
      text += ` ${idx + 1}. ${g.name} (${lvStr}) - ${dropStr}\n`;
    });
    text += `\n`;
  }

  if (beaten.length > 0) {
    text += `✅ กิลด์ที่ตีแล้ว (${beaten.length}):\n`;
    beaten.forEach((g) => {
      text += ` • ${g.name} (${g.level ? `Lv.${g.level}` : 'ไม่ระบุ Lv.'})\n`;
    });
  }

  text += `\n⏰ รีเซ็ตรอบถัดไป: วันพุธ เวลา 05:00 น. (UTC+7)`;

  const textarea = document.getElementById("exportTextArea");
  if (textarea) textarea.value = text;
}

function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  let borderClass = "border-slate-700 text-slate-200";
  if (type === "success") borderClass = "border-emerald-500/40 text-emerald-200";
  else if (type === "warning") borderClass = "border-amber-500/40 text-amber-200";

  toast.className = `flex items-center gap-2.5 px-4 py-2.5 rounded-xl border bg-[#0f172a] shadow-xl text-xs backdrop-blur-md pointer-events-auto transition-all duration-300 transform translate-y-0 opacity-100 ${borderClass}`;
  toast.innerHTML = `<span>${escapeHtml(message)}</span>`;

  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3500);
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function escapeHtml(s) {
  return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

document.addEventListener("DOMContentLoaded", initApp);

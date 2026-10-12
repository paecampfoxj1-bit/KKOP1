// Standalone source code for index.html and app.js matching the exact user UI reference
export const STANDALONE_INDEX_HTML = `<!DOCTYPE html>
<html lang="th" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KKop - ระบบเช็คชื่อและบันทึกเรดแคลน (กิลด์รอง)</title>
  
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"><\/script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: {
              500: '#6366f1',
              600: '#4f46e5',
            }
          },
          fontFamily: {
            sans: ['Prompt', 'sans-serif'],
            chakra: ['Chakra Petch', 'sans-serif'],
          }
        }
      }
    }
  <\/script>

  <!-- Google Fonts: Prompt & Chakra Petch -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&family=Prompt:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  
  <!-- Font Awesome Icons CDN -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">

  <style>
    body { font-family: 'Prompt', sans-serif; background-color: #080c16; color: #f1f5f9; }
    .font-chakra { font-family: 'Chakra Petch', sans-serif; }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #080c16; }
    ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #334155; }
  </style>

  <!-- Firebase Realtime Database SDK (Compat CDN) -->
  <script src="https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js"><\/script>
  <script src="https://www.gstatic.com/firebasejs/10.9.0/firebase-database-compat.js"><\/script>
</head>
<body class="min-h-screen flex flex-col antialiased selection:bg-indigo-500 selection:text-white">

  <!-- Header -->
  <header class="border-b border-slate-800/80 bg-[#070a13]/90 backdrop-blur sticky top-0 z-30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
          <div class="w-full h-full bg-[#080c16] rounded-[10px] flex items-center justify-center">
            <i class="fa-solid fa-shield-halved text-indigo-400 text-lg"></i>
          </div>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl sm:text-2xl font-bold tracking-tight font-chakra text-white flex items-center gap-1.5">
              <span>KKop</span>
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                กิลด์รอง
              </span>
            </h1>
            <span id="syncStatusBadge" class="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span id="syncStatusText">เชื่อมต่อ Firebase</span>
            </span>
          </div>
          <p class="text-xs text-slate-400">ระบบเช็คชื่อ & บันทึกสถานะการลงเรดแคลนแบบเรียลไทม์</p>
        </div>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <button id="btnOpenFirebaseModal" class="px-3 py-1.5 text-xs font-medium bg-[#0c1220] hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl transition-colors flex items-center gap-1.5">
          <i class="fa-solid fa-database text-amber-400"></i>
          <span>ตั้งค่า Firebase</span>
        </button>
        <button id="btnExportLine" class="px-3 py-1.5 text-xs font-medium bg-[#0c1220] hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl transition-colors flex items-center gap-1.5">
          <i class="fa-solid fa-clipboard-list text-emerald-400"></i>
          <span>สรุปส่ง LINE/Discord</span>
        </button>
      </div>
    </div>
  </header>

  <!-- Main Container -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-5">

    <!-- Wednesday Reset Banner & Countdown -->
    <div class="bg-gradient-to-r from-[#0d1424] via-[#0d1424] to-indigo-950/40 border border-indigo-500/30 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-sm">
              <i class="fa-solid fa-clock-rotate-left"></i>
            </span>
            <span class="text-sm font-semibold text-indigo-300">ระบบรีเซ็ตอัตโนมัติประจำสัปดาห์</span>
            <span class="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">ทุกวันพุธ เวลา 05:00 น. (UTC+7)</span>
          </div>
          <p class="text-xs text-slate-400" id="currentCycleLabel">รอบปัจจุบัน: กำลังโหลดข้อมูล...</p>
        </div>

        <!-- Countdown Clock -->
        <div class="flex items-center gap-2 sm:gap-3 bg-[#080c16]/90 px-4 py-2 rounded-xl border border-slate-800 shadow-inner">
          <div class="text-center">
            <div id="countdownDays" class="text-lg sm:text-2xl font-bold font-chakra text-indigo-400">00</div>
            <div class="text-[10px] uppercase text-slate-500">วัน</div>
          </div>
          <span class="text-slate-600 font-bold">:</span>
          <div class="text-center">
            <div id="countdownHours" class="text-lg sm:text-2xl font-bold font-chakra text-white">00</div>
            <div class="text-[10px] uppercase text-slate-500">ชั่วโมง</div>
          </div>
          <span class="text-slate-600 font-bold">:</span>
          <div class="text-center">
            <div id="countdownMins" class="text-lg sm:text-2xl font-bold font-chakra text-white">00</div>
            <div class="text-[10px] uppercase text-slate-500">นาที</div>
          </div>
          <span class="text-slate-600 font-bold">:</span>
          <div class="text-center">
            <div id="countdownSecs" class="text-lg sm:text-2xl font-bold font-chakra text-emerald-400">00</div>
            <div class="text-[10px] uppercase text-slate-500">วินาที</div>
          </div>
          <button id="btnManualReset" title="รีเซ็ตสถานะเป็นรอบใหม่ด้วยตนเอง" class="ml-2 p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg text-xs flex items-center gap-1 transition-colors">
            <i class="fa-solid fa-arrows-rotate"></i>
            <span class="hidden sm:inline">รีเซ็ต</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Filters, Search & Action Bar (Matching Screenshot) -->
    <div class="space-y-3.5">
      <!-- Search & Add Row -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <!-- Search Input -->
        <div class="relative flex-1">
          <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
          <input type="text" id="searchInput" placeholder="ค้นหากิลด์, เลเวล, ของดรอป, บอส..." class="w-full bg-[#0c1220] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors shadow-inner">
        </div>

        <!-- Quick Paste & Add Guild -->
        <div class="flex items-center gap-2 justify-end">
          <button id="btnQuickPaste" class="px-3 py-2 bg-[#0c1220] hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-medium flex items-center gap-2 transition-colors">
            <i class="fa-regular fa-clipboard text-slate-400"></i>
            <span>กด <kbd class="bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-200">Ctrl+V</kbd> เขียนชื่อกิลด์ได้ทันที</span>
          </button>

          <button id="btnOpenAddGuild" class="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all whitespace-nowrap">
            <i class="fa-solid fa-plus"></i>
            <span>เพิ่มกิลด์ใหม่</span>
          </button>
        </div>
      </div>

      <!-- Filters & Sort Row -->
      <div class="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div class="flex flex-wrap items-center gap-2 sm:gap-4 flex-1">
          <!-- Status Tabs -->
          <div class="inline-flex items-center p-1 bg-[#0c1220] rounded-xl border border-slate-800/80 text-xs">
            <button data-status="all" class="status-tab active px-3 py-1.5 rounded-lg font-semibold bg-indigo-600 text-white shadow-sm transition-colors">
              ทั้งหมด (<span id="countTotal">0</span>)
            </button>
            <button data-status="unbeaten" class="status-tab px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors">
              ยังไม่ได้ตี (<span id="countUnbeaten">0</span>)
            </button>
            <button data-status="beaten" class="status-tab px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors">
              ตีแล้ว (<span id="countBeaten">0</span>)
            </button>
          </div>

          <!-- Drop Destination Filters -->
          <div class="flex items-center gap-1.5 text-xs overflow-x-auto scrollbar-none ml-2">
            <span class="text-slate-400 text-xs font-medium mr-1 whitespace-nowrap">ของดรอป:</span>

            <button data-drop="all" class="drop-tab active px-3 py-1.5 rounded-xl border bg-slate-800 text-white border-slate-600 font-semibold transition-colors">
              ทั้งหมด
            </button>

            <button data-drop="inventory" class="drop-tab px-3 py-1.5 rounded-xl border bg-[#0c1220] text-slate-400 border-slate-800/80 hover:text-slate-200 transition-colors flex items-center gap-1.5">
              <span>👛</span>
              <span>ของเข้าตัว</span>
            </button>

            <button data-drop="guild" class="drop-tab px-3 py-1.5 rounded-xl border bg-[#0c1220] text-slate-400 border-slate-800/80 hover:text-slate-200 transition-colors flex items-center gap-1.5">
              <span>🏰</span>
              <span>เข้ากิล</span>
            </button>

            <button data-drop="other" class="drop-tab px-3 py-1.5 rounded-xl border bg-[#0c1220] text-slate-400 border-slate-800/80 hover:text-slate-200 transition-colors flex items-center gap-1.5">
              <span>❓</span>
              <span>อื่นๆ</span>
            </button>
          </div>
        </div>

        <!-- Sort Select -->
        <div class="relative">
          <div class="flex items-center gap-1.5 bg-[#0c1220] border border-slate-800/80 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <i class="fa-solid fa-arrow-down-up-across-line text-amber-400"></i>
            <select id="sortSelect" class="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer pr-2">
              <option value="unbeaten_level_desc" class="bg-slate-900 text-white">ยังไม่ตีบนสุด · Lv. มาก ➔ น้อย</option>
              <option value="unbeaten_level_asc" class="bg-slate-900 text-white">ยังไม่ตีบนสุด · Lv. น้อย ➔ มาก</option>
              <option value="beaten_first" class="bg-slate-900 text-white">ตีแล้วบนสุด</option>
              <option value="name_asc" class="bg-slate-900 text-white">ชื่อกิลด์ (ก-ฮ / A-Z)</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- 2-Column Cards Grid (Matching Screenshot) -->
    <div id="guildCardsGrid" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Dynamic cards rendered by app.js -->
    </div>

    <!-- Empty State -->
    <div id="emptyState" class="hidden py-20 text-center text-slate-500 space-y-3 bg-[#0b101e] border border-slate-800/80 rounded-2xl">
      <i class="fa-solid fa-users-slash text-4xl text-slate-600 mb-1"></i>
      <p class="text-sm font-medium">ไม่พบกิลด์ตามเงื่อนไขการค้นหาหรือตัวกรองที่เลือก</p>
      <button id="btnEmptyAdd" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md">
        + เพิ่มกิลด์ใหม่
      </button>
    </div>

  </main>

  <!-- Footer -->
  <footer class="border-t border-slate-800/80 bg-[#070a13] py-4 text-center text-xs text-slate-500">
    <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
      <p>KKop Guild Sub-Clan Raid Manager &bull; Realtime Database Sync</p>
      <p>รีเซ็ตสถานะเป็น "ยังไม่ได้ตี" ทุกวันพุธ เวลา 05:00 น. (UTC+7)</p>
    </div>
  </footer>

  <!-- Modal: Add / Edit Guild -->
  <div id="guildModal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
    <div class="bg-[#0e1424] border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl relative">
      <div class="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 id="modalTitle" class="text-base font-bold text-white flex items-center gap-2">
          <i class="fa-solid fa-plus text-indigo-400"></i>
          <span>เพิ่มกิลด์ใหม่</span>
        </h3>
        <button id="btnCloseGuildModal" class="text-slate-400 hover:text-white p-1 rounded-lg">
          <i class="fa-solid fa-xmark text-lg"></i>
        </button>
      </div>

      <form id="guildForm" class="mt-4 space-y-3.5 text-xs">
        <input type="hidden" id="formGuildId">

        <!-- Icon Picker -->
        <div>
          <label class="block text-slate-300 font-medium mb-1.5">เลือกสัญลักษณ์กิลด์ (Emblem)</label>
          <div class="grid grid-cols-4 gap-2" id="iconPicker">
            <!-- Rendered by JS -->
          </div>
          <input type="hidden" id="formGuildIcon" value="dragon">
        </div>

        <!-- Name -->
        <div>
          <label class="block text-slate-300 font-medium mb-1">ชื่อกิลด์ / ชื่อบอส <span class="text-indigo-400">*</span></label>
          <input type="text" id="formGuildName" required placeholder="เช่น SOLOLEVELING, THAILAND, Crows" class="w-full bg-[#070b14] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs font-chakra tracking-wide uppercase">
        </div>

        <!-- Level -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="text-slate-300 font-medium">เลเวลของกิลด์ (Level)</label>
            <label class="flex items-center gap-1.5 text-slate-400 cursor-pointer">
              <input type="checkbox" id="formNoLevel" class="rounded bg-slate-900 border-slate-700 text-indigo-500">
              <span>ไม่ระบุเลเวล</span>
            </label>
          </div>
          <input type="number" id="formGuildLevel" min="1" max="100" value="12" placeholder="เช่น 12" class="w-full bg-[#070b14] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs font-mono">
        </div>

        <!-- Drop Type -->
        <div>
          <label class="block text-slate-300 font-medium mb-1">ประเภทของดรอป</label>
          <select id="formDropType" class="w-full bg-[#070b14] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs">
            <option value="inventory">👛 1.ของเข้าตัว</option>
            <option value="guild">🏰 2.เข้ากิล</option>
            <option value="other">❓ 3.อื่นๆ (ระบุข้อความ)</option>
          </select>
          <input type="text" id="formDropNote" placeholder="ระบุข้อความ เช่น คนอื่นตี" class="w-full bg-[#070b14] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs mt-1.5 hidden">
        </div>

        <!-- Status -->
        <div>
          <label class="block text-slate-300 font-medium mb-1">สถานะปัจจุบัน</label>
          <select id="formStatus" class="w-full bg-[#070b14] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs">
            <option value="unbeaten">○ ยังไม่ได้ตี</option>
            <option value="beaten">✓ ตีแล้วเรียบร้อย</option>
          </select>
        </div>

        <div class="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
          <button type="button" id="btnCancelGuildModal" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors">
            ยกเลิก
          </button>
          <button type="submit" class="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-lg shadow-md transition-colors">
            บันทึกข้อมูล
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Modal: Export Summary -->
  <div id="exportModal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
    <div class="bg-[#0e1424] border border-slate-800 rounded-2xl w-full max-w-lg p-5 shadow-2xl relative">
      <div class="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 class="text-base font-bold text-white flex items-center gap-2">
          <i class="fa-solid fa-clipboard-list text-emerald-400"></i>
          <span>สรุปสถานะส่ง LINE / Discord</span>
        </h3>
        <button id="btnCloseExportModal" class="text-slate-400 hover:text-white p-1 rounded-lg">
          <i class="fa-solid fa-xmark text-lg"></i>
        </button>
      </div>

      <div class="mt-4 space-y-3">
        <p class="text-xs text-slate-400">สามารถคัดลอกข้อความสรุปด้านล่างไปวางในกลุ่มกิลด์ได้ทันที:</p>
        <textarea id="exportTextArea" readonly rows="10" class="w-full bg-[#070b14] border border-slate-800 rounded-lg p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500 resize-none"></textarea>
      </div>

      <div class="mt-4 flex items-center justify-end gap-2 border-t border-slate-800 pt-3">
        <button id="btnCopyExportText" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors">
          <i class="fa-solid fa-copy"></i>
          <span>คัดลอกข้อความ</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Modal: Firebase Config Setup -->
  <div id="firebaseModal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
    <div class="bg-[#0e1424] border border-slate-800 rounded-2xl w-full max-w-lg p-5 shadow-2xl relative">
      <div class="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 class="text-base font-bold text-white flex items-center gap-2">
          <i class="fa-solid fa-database text-amber-500"></i>
          <span>ตั้งค่าเชื่อมต่อ Firebase Realtime Database</span>
        </h3>
        <button id="btnCloseFirebaseModal" class="text-slate-400 hover:text-white p-1 rounded-lg">
          <i class="fa-solid fa-xmark text-lg"></i>
        </button>
      </div>

      <div class="mt-4 space-y-3 text-xs">
        <p class="text-slate-400">วางค่า Database URL จาก Firebase Console (ชื่อโปรเจกต์ KKop):</p>
        <div>
          <label class="block text-slate-300 font-medium mb-1">Database URL <span class="text-amber-400">*</span></label>
          <input type="text" id="fbConfigDbUrl" placeholder="https://kkop-default-rtdb.asia-southeast1.firebasedatabase.app" class="w-full bg-[#070b14] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs font-mono">
        </div>
        <div>
          <label class="block text-slate-300 font-medium mb-1">API Key</label>
          <input type="text" id="fbConfigApiKey" placeholder="AIzaSy..." class="w-full bg-[#070b14] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs font-mono">
        </div>
        <div>
          <label class="block text-slate-300 font-medium mb-1">Project ID</label>
          <input type="text" id="fbConfigProjectId" placeholder="kkop-guild" class="w-full bg-[#070b14] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs font-mono">
        </div>
      </div>

      <div class="mt-5 flex items-center justify-between border-t border-slate-800 pt-3">
        <button id="btnResetToDemoData" class="px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors">
          รีเซ็ตข้อมูลตัวอย่าง
        </button>
        <div class="flex items-center gap-2">
          <button id="btnCancelFirebaseModal" class="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors">ปิด</button>
          <button id="btnSaveFirebaseConfig" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs transition-colors">บันทึกการเชื่อมต่อ</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Toast Container -->
  <div id="toastContainer" class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"></div>

  <!-- App Logic -->
  <script src="app.js"><\/script>
</body>
</html>`;

export const STANDALONE_APP_JS = `/**
 * KKop Guild Sub-Clan Raid Tracker & Attendance System
 * Realtime Database Sync & Wednesday 05:00 AM (UTC+7) Auto Reset Logic
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
  firebaseConfig: null
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
  const cycleKey = \`CYCLE_\${y}_\${m}_\${d}_0500\`;

  return { cycleKey, cycleStartThai, nextResetThai, msRemaining };
}

function formatCycleDateString(dateObj) {
  const d = dateObj.getDate();
  const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const m = months[dateObj.getMonth()];
  const y = dateObj.getFullYear() + 543;
  return \`รอบวันพุธที่ \${d} \${m} \${y} เวลา 05:00 น.\`;
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
  setInterval(checkAndTriggerWeeklyReset, 10000);
}

function loadSavedFirebaseConfig() {
  const saved = localStorage.getItem("kkop_firebase_config");
  if (saved) {
    try { state.firebaseConfig = JSON.parse(saved); } catch (e) {}
  }
}

function setupFirebaseOrFallback() {
  const config = state.firebaseConfig || DEFAULT_FIREBASE_CONFIG;
  const hasValidDbUrl = config.databaseURL && config.databaseURL.trim().length > 0 && !config.databaseURL.includes("your-project");

  if (window.firebase && hasValidDbUrl) {
    try {
      if (!firebase.apps.length) {
        firebaseApp = firebase.initializeApp(config);
      } else {
        firebaseApp = firebase.app();
      }
      firebaseDb = firebase.database();
      dbRef = firebaseDb.ref("guild_raid_kkop");

      updateSyncStatus(true, "เชื่อมต่อ Firebase (KKop)");

      dbRef.on("value", (snapshot) => {
        const val = snapshot.val();
        if (val) {
          state.currentCycle = val.current_cycle || "";
          state.lastResetTime = val.last_reset_time || null;
          if (val.guilds) {
            state.guilds = Array.isArray(val.guilds) 
              ? val.guilds.filter(Boolean) 
              : Object.keys(val.guilds).map(k => ({ id: k, ...val.guilds[k] }));
          } else {
            state.guilds = [];
          }
          checkAndTriggerWeeklyReset();
          renderApp();
        } else {
          saveDataToDatabase(INITIAL_DEMO_GUILDS);
        }
      }, (error) => {
        console.warn("RTDB error, using LocalStorage:", error);
        fallbackToLocalStorage();
      });
      return;
    } catch (err) {
      fallbackToLocalStorage();
    }
  } else {
    fallbackToLocalStorage();
  }
}

function fallbackToLocalStorage() {
  isFirebaseConnected = false;
  updateSyncStatus(false, "โหมด LocalStorage (ออฟไลน์)");

  const stored = localStorage.getItem("kkop_guild_data");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      state.guilds = parsed.guilds || INITIAL_DEMO_GUILDS;
      state.currentCycle = parsed.current_cycle || "";
      state.lastResetTime = parsed.last_reset_time || null;
    } catch (e) {
      state.guilds = INITIAL_DEMO_GUILDS;
    }
  } else {
    state.guilds = INITIAL_DEMO_GUILDS;
  }
  checkAndTriggerWeeklyReset();
  renderApp();
}

function updateSyncStatus(connected, text) {
  isFirebaseConnected = connected;
  const badge = document.getElementById("syncStatusBadge");
  const textEl = document.getElementById("syncStatusText");
  if (!badge || !textEl) return;
  textEl.textContent = text;
  badge.className = connected
    ? "inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
    : "inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30";
}

function saveDataToDatabase(newGuilds = null) {
  const guildsToSave = newGuilds !== null ? newGuilds : state.guilds;
  const cycleInfo = getWednesdayCycleInfo();

  const payload = {
    current_cycle: state.currentCycle || cycleInfo.cycleKey,
    last_reset_time: state.lastResetTime || Date.now(),
    last_updated: Date.now(),
    guilds: guildsToSave
  };

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
      ? "รีเซ็ตสถานะเป็น \\"ยังไม่ได้ตี\\" ทุกกิลด์ด้วยตนเองเรียบร้อย!"
      : "ระบบรีเซ็ตสถานะเรดประจำสัปดาห์อัตโนมัติ (วันพุธ 05:00 น.) แล้ว!",
    "success"
  );
  renderApp();
}

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
      cycleLabel.textContent = \`\${formatCycleDateString(cycleInfo.cycleStartThai)} (สิ้นสุดพุธหน้า 05:00 น.)\`;
    }
  }
  tick();
  setInterval(tick, 1000);
}

function renderApp() {
  renderCounters();
  renderGuildCards();
}

function renderCounters() {
  const total = state.guilds.length;
  const unbeaten = state.guilds.filter(g => g.status === "unbeaten").length;
  const beaten = state.guilds.filter(g => g.status === "beaten").length;

  setText("countTotal", total);
  setText("countUnbeaten", unbeaten);
  setText("countBeaten", beaten);
}

function getAvatarSvg(icon) {
  switch (icon) {
    case 'dragon':
      return \`<div class="w-13 h-13 rounded-xl bg-[#121624] border border-red-500/30 flex items-center justify-center p-1.5 shadow-md relative overflow-hidden"><svg viewBox="0 0 24 24" fill="none" class="w-full h-full text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]" stroke="currentColor" stroke-width="1.8"><path d="M12 2C6.5 2 2 6.5 2 12c0 3.5 1.8 6.6 4.5 8.4-.2-1.8.4-3.7 1.8-5.1 1.7-1.7 4.2-2.1 6.3-1.1-.9-1.2-1.3-2.7-1.1-4.2.4-2.8 2.8-4.9 5.6-4.9 1.4 0 2.6.5 3.6 1.4-.4-3.7-3.5-6.5-7.7-6.5z" fill="currentColor" fill-opacity="0.85"/><circle cx="19" cy="10" r="1.5" fill="#fca5a5"/></svg></div>\`;
    case 'lion':
      return \`<div class="w-13 h-13 rounded-xl bg-[#121624] border border-cyan-500/30 flex items-center justify-center p-1.5 shadow-md relative overflow-hidden"><svg viewBox="0 0 24 24" fill="none" class="w-full h-full text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]" stroke="currentColor" stroke-width="1.8"><path d="M12 3a9 9 0 0 0-9 9c0 3.8 2.4 7 5.8 8.3-.3-1.4.1-3 1.2-4.1 1.2-1.2 3-1.6 4.6-.9-.6-.9-.8-2-.6-3.1.3-2 1.9-3.5 3.9-3.5 1 0 1.8.3 2.5 1-.2-3.8-3.4-6.7-7.4-6.7z" fill="currentColor" fill-opacity="0.85"/><circle cx="16" cy="9" r="1.5" fill="#a5f3fc"/><path d="M8 14c1 1 2.5 1.5 4 1" stroke="#a5f3fc" stroke-width="2" stroke-linecap="round"/></svg></div>\`;
    case 'crows':
      return \`<div class="w-13 h-13 rounded-xl bg-[#121624] border border-amber-500/30 flex items-center justify-center p-1.5 shadow-md relative overflow-hidden"><svg viewBox="0 0 24 24" fill="none" class="w-full h-full text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.7)]" stroke="currentColor" stroke-width="1.8"><path d="M12 2a5 5 0 0 0-5 5v3c0 2 1.5 3.5 3.5 4H8l-3 4h14l-3-4h-2.5c2-.5 3.5-2 3.5-4V7a5 5 0 0 0-5-5z" fill="currentColor" fill-opacity="0.85"/><circle cx="10" cy="7" r="1" fill="#fef3c7"/><circle cx="14" cy="7" r="1" fill="#fef3c7"/><path d="M9 18l3 4 3-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></div>\`;
    case 'devil':
      return \`<div class="w-13 h-13 rounded-xl bg-[#121624] border border-rose-500/30 flex items-center justify-center p-1.5 shadow-md relative overflow-hidden"><svg viewBox="0 0 24 24" fill="none" class="w-full h-full text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.7)]" stroke="currentColor" stroke-width="1.8"><path d="M4 6c0 5 3 13 8 16 5-3 8-11 8-16-3 1-6 0-8-2-2 2-5 3-8 2z" fill="currentColor" fill-opacity="0.85"/><path d="M9 11l2 2-2 2M15 11l-2 2 2 2" stroke="#ffe4e6" stroke-width="2" stroke-linecap="round"/><path d="M8 4l2 3M16 4l-2 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></div>\`;
    default:
      return \`<div class="w-13 h-13 rounded-xl bg-[#121624] border border-indigo-500/30 flex items-center justify-center p-1.5 shadow-md"><i class="fa-solid fa-shield text-indigo-400 text-xl"></i></div>\`;
  }
}

function renderGuildCards() {
  const container = document.getElementById("guildCardsGrid");
  const emptyState = document.getElementById("emptyState");
  if (!container) return;

  let list = state.guilds.filter(g => {
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase().trim();
      const matchName = g.name.toLowerCase().includes(q);
      const matchLevel = g.level !== null && String(g.level).includes(q);
      const matchDrop = (g.dropType || "").toLowerCase().includes(q) || (g.dropNote || "").toLowerCase().includes(q);
      if (!matchName && !matchLevel && !matchDrop) return false;
    }

    if (state.statusFilter === "unbeaten" && g.status !== "unbeaten") return false;
    if (state.statusFilter === "beaten" && g.status !== "beaten") return false;
    if (state.dropFilter !== "all" && g.dropType !== state.dropFilter) return false;
    return true;
  });

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

    let dropHtml = "";
    if (g.dropType === "inventory") {
      dropHtml = \`<span class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-medium"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span><span>1.ของเข้าตัว</span></span>\`;
    } else if (g.dropType === "guild") {
      dropHtml = \`<span class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-blue-950/60 text-blue-300 border border-blue-500/30 font-medium"><span class="w-1.5 h-1.5 rounded-full bg-blue-400"></span><span>2.เข้ากิล</span></span>\`;
    } else {
      dropHtml = \`<span class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-amber-950/60 text-amber-300 border border-amber-500/30 font-medium"><span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span><span>3.อื่นๆ: \${escapeHtml(g.dropNote || 'คนอื่นตี')}</span></span>\`;
    }

    const cardClass = isBeaten
      ? "bg-[#0d1525] border border-emerald-500/40 shadow-lg shadow-emerald-950/20"
      : "bg-[#0b101d] border border-slate-800/80 hover:border-slate-700/80";

    const buttonClass = isBeaten
      ? "bg-[#059669] hover:bg-[#047857] text-white shadow-md shadow-emerald-950/40"
      : "bg-[#131b2e] hover:bg-[#1a253e] text-slate-300 border border-slate-800";

    const buttonContent = isBeaten
      ? \`<i class="fa-solid fa-circle-check text-white"></i><span>ตีแล้วเรียบร้อย</span>\`
      : \`<i class="fa-regular fa-circle text-slate-400"></i><span>ยังไม่ได้ตี</span>\`;

    return \`
      <div class="rounded-2xl p-4 sm:p-5 transition-all duration-200 relative flex flex-col justify-between \${cardClass}">
        <div>
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              \${getAvatarSvg(g.avatarIcon)}
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <h3 class="text-base sm:text-lg font-bold text-white tracking-wide uppercase font-chakra">
                    \${escapeHtml(g.name)}
                  </h3>
                  \${isBeaten ? '<span class="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">ตีแล้ว</span>' : ''}
                </div>
                <div class="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                  <i class="fa-solid fa-user-group text-slate-500 text-[10px]"></i>
                  <span>\${g.level ? \`Lv.\${g.level}\` : 'ไม่ระบุเลเวล'}</span>
                </div>
              </div>
            </div>
            <button onclick="openEditGuild('\${g.id}')" class="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer" title="แก้ไข">
              <i class="fa-solid fa-pen text-sm"></i>
            </button>
          </div>

          <div class="mt-3.5 flex items-center gap-2">
            \${dropHtml}
          </div>
        </div>

        <div class="mt-5 flex items-center gap-2 pt-1">
          <button onclick="toggleGuildStatus('\${g.id}')" class="flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer \${buttonClass}">
            \${buttonContent}
          </button>
          <button onclick="deleteGuild('\${g.id}')" class="p-2.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer" title="ลบ">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
    \`;
  }).join("");
}

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
  document.getElementById("guildModal").classList.remove("hidden");
};

window.deleteGuild = function(id) {
  const g = state.guilds.find(x => x.id === id);
  if (!g) return;

  if (confirm(\`ต้องการลบกิลด์ "\${g.name}" ใช่หรือไม่?\`)) {
    const updated = state.guilds.filter(x => x.id !== id);
    saveDataToDatabase(updated);
    showToast(\`ลบกิลด์ "\${g.name}" เรียบร้อยแล้ว\`, "info");
  }
};

function renderIconPicker() {
  const picker = document.getElementById("iconPicker");
  if (!picker) return;

  const icons = ['dragon', 'lion', 'crows', 'devil'];
  picker.innerHTML = icons.map(ic => \`
    <button type="button" onclick="setSelectedIcon('\${ic}')" data-icon="\${ic}" class="icon-choice p-1.5 rounded-xl border border-slate-800 bg-[#0a0f1d] hover:border-slate-700 flex items-center justify-center transition-all cursor-pointer">
      \${getAvatarSvg(ic)}
    </button>
  \`).join("");
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

function handleQuickPaste() {
  const input = prompt("พิมพ์หรือวางชื่อกิลด์ที่ต้องการเพิ่ม (ใส่หลายชื่อคั่นด้วยเครื่องหมายจุลภาค , หรือบรรทัดใหม่):");
  if (!input || !input.trim()) return;

  const names = input.split(/[,\\n]/).map(s => s.trim().toUpperCase()).filter(Boolean);
  if (names.length === 0) return;

  const icons = ['dragon', 'lion', 'crows', 'devil'];
  const newItems = names.map((name, i) => ({
    id: "g_" + Date.now() + "_" + i + "_" + Math.random().toString(36).substring(2, 5),
    name,
    level: 12,
    status: "unbeaten",
    dropType: "inventory",
    avatarIcon: icons[i % icons.length],
    updatedAt: Date.now()
  }));

  const updated = [...state.guilds, ...newItems];
  saveDataToDatabase(updated);
  showToast(\`เพิ่มกิลด์สำเร็จ \${newItems.length} รายการ\`, "success");
}

function setupEventListeners() {
  document.getElementById("searchInput")?.addEventListener("input", (e) => {
    state.searchQuery = e.target.value.trim();
    renderGuildCards();
  });

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

  document.getElementById("sortSelect")?.addEventListener("change", (e) => {
    state.sortBy = e.target.value;
    renderGuildCards();
  });

  document.getElementById("btnQuickPaste")?.addEventListener("click", handleQuickPaste);

  window.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
      const tag = document.activeElement?.tagName.toLowerCase();
      if (tag !== "input" && tag !== "textarea") {
        e.preventDefault();
        handleQuickPaste();
      }
    }
  });

  document.getElementById("btnManualReset")?.addEventListener("click", () => {
    if (confirm("ต้องการรีเซ็ตสถานะเป็น \\"ยังไม่ได้ตี\\" ทุกกิลด์ทันทีหรือไม่?")) {
      const cycleInfo = getWednesdayCycleInfo();
      performReset(cycleInfo.cycleKey, true);
    }
  });

  const openAddHandler = () => {
    document.getElementById("modalTitle").innerHTML = '<i class="fa-solid fa-plus text-indigo-400"></i> เพิ่มกิลด์ใหม่';
    document.getElementById("guildForm").reset();
    document.getElementById("formGuildId").value = "";
    document.getElementById("formGuildLevel").value = "12";
    document.getElementById("formNoLevel").checked = false;
    document.getElementById("formDropNote").classList.add("hidden");
    setSelectedIcon("dragon");
    document.getElementById("guildModal").classList.remove("hidden");
  };

  document.getElementById("btnOpenAddGuild")?.addEventListener("click", openAddHandler);
  document.getElementById("btnEmptyAdd")?.addEventListener("click", openAddHandler);

  const closeGuildModal = () => document.getElementById("guildModal")?.classList.add("hidden");
  document.getElementById("btnCloseGuildModal")?.addEventListener("click", closeGuildModal);
  document.getElementById("btnCancelGuildModal")?.addEventListener("click", closeGuildModal);

  document.getElementById("formDropType")?.addEventListener("change", (e) => {
    const noteEl = document.getElementById("formDropNote");
    if (e.target.value === "other") {
      noteEl.classList.remove("hidden");
    } else {
      noteEl.classList.add("hidden");
    }
  });

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

    if (!name) return;

    let updated = [];
    if (id) {
      updated = state.guilds.map(g => g.id === id ? {
        ...g, name, level, dropType, dropNote: dropType === 'other' ? dropNote || 'คนอื่นตี' : undefined, status, avatarIcon, updatedAt: Date.now()
      } : g);
      showToast(\`อัปเดตข้อมูล \${name} สำเร็จ\`, "success");
    } else {
      const newGuild = {
        id: "g_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
        name, level, dropType, dropNote: dropType === 'other' ? dropNote || 'คนอื่นตี' : undefined, status, avatarIcon,
        beatenAt: status === "beaten" ? Date.now() : null,
        updatedAt: Date.now()
      };
      updated = [...state.guilds, newGuild];
      showToast(\`เพิ่มกิลด์ "\${name}" เรียบร้อย\`, "success");
    }

    saveDataToDatabase(updated);
    closeGuildModal();
  });

  document.getElementById("btnExportLine")?.addEventListener("click", () => {
    generateExportSummary();
    document.getElementById("exportModal")?.classList.remove("hidden");
  });
  document.getElementById("btnCloseExportModal")?.addEventListener("click", () => {
    document.getElementById("exportModal")?.classList.add("hidden");
  });

  document.getElementById("btnCopyExportText")?.addEventListener("click", () => {
    const textEl = document.getElementById("exportTextArea");
    if (textEl) {
      textEl.select();
      navigator.clipboard.writeText(textEl.value).then(() => {
        showToast("คัดลอกข้อความสรุปเรียบร้อยแล้ว!", "success");
      });
    }
  });

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
      authDomain: \`\${projectId}.firebaseapp.com\`,
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

  let text = \`🛡️ [สรุปสถานะเรดแคลน กิลด์รอง KKop]\\n\`;
  text += \`📅 \${dateStr}\\n\`;
  text += \`------------------------------------\\n\`;
  text += \`⚔️ ตีแล้วเรียบร้อย: \${beaten.length}/\${total} กิลด์\\n\`;
  text += \`⏳ ยังไม่ได้ตี: \${unbeaten.length} กิลด์\\n\`;
  text += \`------------------------------------\\n\\n\`;

  if (unbeaten.length > 0) {
    text += \`⚠️ กิลด์ที่ยังไม่ได้ตี (\${unbeaten.length}):\\n\`;
    unbeaten.forEach((g, idx) => {
      const lvStr = g.level ? \`Lv.\${g.level}\` : 'ไม่ระบุ Lv.';
      const dropStr = g.dropType === 'inventory' ? 'ของเข้าตัว' : g.dropType === 'guild' ? 'เข้ากิล' : \`อื่นๆ (\${g.dropNote || '-'})\`;
      text += \` \${idx + 1}. \${g.name} (\${lvStr}) - \${dropStr}\\n\`;
    });
    text += \`\\n\`;
  }

  if (beaten.length > 0) {
    text += \`✅ กิลด์ที่ตีแล้ว (\${beaten.length}):\\n\`;
    beaten.forEach((g) => {
      text += \` • \${g.name} (\${g.level ? \`Lv.\${g.level}\` : 'ไม่ระบุ Lv.'})\\n\`;
    });
  }

  text += \`\\n⏰ รีเซ็ตรอบถัดไป: วันพุธ เวลา 05:00 น. (UTC+7)\`;
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

  toast.className = \`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border bg-[#0f172a] shadow-xl text-xs backdrop-blur-md pointer-events-auto transition-all duration-300 transform translate-y-0 opacity-100 \${borderClass}\`;
  toast.innerHTML = \`<span>\${escapeHtml(message)}</span>\`;

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
`;

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

    <!-- Hint Banner for Ctrl+V Image Paste -->
    <div class="p-3 bg-gradient-to-r from-indigo-950/60 via-[#0e162d] to-purple-950/40 border border-indigo-500/30 rounded-2xl flex items-center justify-between gap-3 text-xs flex-wrap">
      <div class="flex items-center gap-2.5">
        <div class="p-1.5 bg-indigo-500/20 rounded-lg text-indigo-400">
          <i class="fa-solid fa-camera"></i>
        </div>
        <div>
          <span class="font-semibold text-white">เปลี่ยนรูปภาพได้ง่ายๆ:</span>
          <span class="text-slate-300">ชี้เมาส์ที่การ์ดกิลด์ แล้วกด <kbd class="bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-[11px] font-mono text-indigo-300">Ctrl + V</kbd> วางรูปภาพได้ทันที หรือคลิกที่รูปเพื่อเลือกไฟล์จากเครื่อง</span>
        </div>
      </div>
    </div>

    <!-- Filters, Search & Action Bar (Matching Screenshot) -->
    <div class="space-y-3.5">
      <!-- Search & Add Row -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <!-- Search Input with Camera Button -->
        <div class="relative flex-1">
          <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none"></i>
          <input type="text" id="searchInput" placeholder="ค้นหากิลด์, เลเวล, ของดรอป, บอส..." class="w-full bg-[#0c1220] border border-slate-800 rounded-xl pl-10 pr-12 sm:pr-28 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors shadow-inner">
          <button id="btnAiSearchPhoto" type="button" class="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-xs" title="📷 ส่งรูปเพื่อถาม AI ว่ากิลไหนลงไปแล้วบ้าง">
            <i class="fa-solid fa-camera text-indigo-400"></i>
            <span class="hidden sm:inline text-[11px] font-semibold text-indigo-300">ถาม AI จากรูป</span>
          </button>
        </div>

        <!-- Quick Paste Picture & Add Guild -->
        <div class="flex items-center gap-2 justify-end flex-wrap sm:flex-nowrap">
          <button id="btnQuickChangePicture" class="px-3 py-2 bg-[#0c1220] hover:bg-[#131b2f] border border-indigo-500/40 hover:border-indigo-500 text-indigo-300 rounded-xl text-xs font-medium flex items-center gap-2 transition-all cursor-pointer">
            <i class="fa-solid fa-camera text-indigo-400"></i>
            <span>เปลี่ยนรูป: กด <kbd class="bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-[10px] font-mono text-indigo-200">Ctrl+V</kbd> วางรูปได้</span>
          </button>

          <button id="btnOpenAddGuild" class="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all whitespace-nowrap">
            <i class="fa-solid fa-plus"></i>
            <span>เพิ่มกิลด์ใหม่</span>
          </button>
        </div>
      </div>

      <!-- Filters & Sort Row -->
      <div class="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 flex-1">
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

        <!-- Icon Picker & Ctrl+V Paste Area -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="text-slate-300 font-medium">เลือกสัญลักษณ์กิลด์ (Emblem)</label>
            <span id="pasteToast" class="text-[11px] text-emerald-400 font-medium hidden items-center gap-1">
              <i class="fa-solid fa-check"></i> วางรูปภาพสำเร็จ!
            </span>
          </div>

          <!-- Custom Image Ctrl+V Paste Box -->
          <div class="mb-2 p-2.5 rounded-xl border border-dashed border-indigo-500/40 bg-[#070b14] flex items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <div id="customImagePreviewBox" class="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 shrink-0 overflow-hidden">
                <i class="fa-regular fa-image text-indigo-400 text-lg"></i>
              </div>
              <div>
                <div class="text-xs font-semibold text-white flex items-center gap-1.5">
                  <span id="customImageLabel">เปลี่ยนรูป: กด Ctrl+V ได้ทันที</span>
                  <span id="customImageBadge" class="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded-full hidden">กำลังใช้งาน</span>
                </div>
                <p id="customImageSubtext" class="text-[11px] text-slate-400 mt-0.5">คัดลอกรูปภาพแล้วกด Ctrl+V หรือคลิกเลือกไฟล์</p>
              </div>
            </div>

            <div class="flex items-center gap-1">
              <button type="button" id="btnRemoveCustomImage" class="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors hidden" title="ลบรูปภาพ">
                <i class="fa-solid fa-trash-can text-xs"></i>
              </button>
              <button type="button" id="btnUploadImageFile" class="px-2.5 py-1.5 bg-[#0e1628] hover:bg-slate-800 text-indigo-300 border border-indigo-500/30 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-colors">
                <i class="fa-solid fa-arrow-up-from-bracket text-xs"></i>
                <span>เลือกไฟล์</span>
              </button>
            </div>

            <input type="file" id="formFileInput" accept="image/*" class="hidden">
            <input type="hidden" id="formCustomImage" value="">
          </div>

          <!-- Presets Grid -->
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

  <!-- Modal: Change Guild Picture (Ctrl+V Supported) -->
  <div id="changePictureModal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
    <div class="bg-[#0e1424] border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl relative">
      <div class="flex items-center justify-between pb-3.5 border-b border-slate-800">
        <div class="flex items-center gap-2.5">
          <div class="p-2 bg-indigo-950/70 border border-indigo-500/30 rounded-xl text-indigo-400">
            <i class="fa-solid fa-camera"></i>
          </div>
          <div>
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <span id="cpGuildName">เปลี่ยนรูปกิลด์</span>
            </h3>
            <p class="text-[11px] text-slate-400">
              กด <kbd class="bg-slate-900 border border-slate-700 px-1 py-0.5 rounded text-[10px] font-mono text-indigo-300">Ctrl+V</kbd> เพื่อวางรูปภาพได้ทันที
            </p>
          </div>
        </div>
        <button id="btnCloseChangePictureModal" class="text-slate-400 hover:text-white p-1 rounded-lg">
          <i class="fa-solid fa-xmark text-lg"></i>
        </button>
      </div>

      <div class="mt-4 space-y-4">
        <!-- Preview Box -->
        <div class="flex items-center justify-center gap-6 p-4 rounded-xl bg-[#080c16] border border-slate-800/80">
          <div class="text-center">
            <div class="text-[11px] text-slate-400 mb-1.5 font-medium">รูปที่กำลังใช้งาน</div>
            <div id="cpCurrentPreview" class="w-18 h-18 mx-auto flex items-center justify-center"></div>
          </div>
          <div id="cpRemoveBtnContainer" class="hidden">
            <button id="btnCpRemoveImage" type="button" class="px-2.5 py-1.5 bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 rounded-lg text-xs flex items-center gap-1.5 transition-colors">
              <i class="fa-solid fa-trash-can text-xs"></i>
              <span>ใช้สัญลักษณ์เดิม</span>
            </button>
          </div>
        </div>

        <!-- Drop / Paste Zone -->
        <div id="cpDropZone" class="p-6 rounded-2xl border-2 border-dashed border-indigo-500/40 bg-[#090e1c] hover:border-indigo-400/80 hover:bg-[#0c1224] transition-all cursor-pointer text-center relative overflow-hidden">
          <div class="w-12 h-12 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-3 shadow-md">
            <i class="fa-solid fa-upload text-xl"></i>
          </div>
          <div class="text-sm font-bold text-white flex items-center justify-center gap-2">
            <span>กด</span>
            <span class="px-2 py-0.5 bg-indigo-900/60 border border-indigo-500/40 text-indigo-200 rounded-lg font-mono text-xs shadow-sm">Ctrl + V</span>
            <span>เพื่อวางรูปภาพ</span>
          </div>
          <p class="text-xs text-slate-400 mt-1.5">
            คัดลอกรูปภาพแล้วกดวาง หรือคลิกเพื่อเลือกไฟล์จากคอมพิวเตอร์/มือถือ
          </p>
          <input type="file" id="cpFileInput" accept="image/*" class="hidden">
        </div>
      </div>

      <div class="mt-5 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
        <button id="btnCancelChangePicture" class="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-xl">ยกเลิก</button>
        <button id="btnSaveChangePicture" class="px-5 py-2 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-1.5">
          <i class="fa-solid fa-check"></i>
          <span>บันทึกรูปภาพ</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Modal: Quick Paste Image from Global Ctrl+V -->
  <div id="quickPasteImageModal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
    <div class="bg-[#0e1424] border border-slate-800 rounded-2xl w-full max-w-lg p-5 shadow-2xl relative max-h-[90vh] flex flex-col">
      <div class="flex items-start justify-between pb-3 border-b border-slate-800 shrink-0">
        <div class="flex items-center gap-3">
          <div id="qpImageThumbnail" class="w-12 h-12 rounded-xl bg-slate-900 border border-indigo-500/50 p-0.5 shadow-md relative overflow-hidden shrink-0"></div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-base font-bold text-white">ตรวจพบรูปภาพจาก Ctrl+V!</h3>
              <span class="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-medium">พร้อมใช้งาน</span>
            </div>
            <p class="text-xs text-slate-400 mt-0.5">เลือกกิลด์ที่ต้องการเปลี่ยนรูปภาพนี้:</p>
          </div>
        </div>
        <button id="btnCloseQuickPasteModal" class="text-slate-400 hover:text-white p-1 rounded-lg">
          <i class="fa-solid fa-xmark text-lg"></i>
        </button>
      </div>

      <div class="my-3 shrink-0 relative">
        <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
        <input type="text" id="qpSearchInput" placeholder="ค้นหากิลด์ที่ต้องการเปลี่ยนรูป..." class="w-full bg-[#080d1a] border border-slate-800 rounded-xl pl-8 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500">
      </div>

      <div id="qpGuildsList" class="flex-1 overflow-y-auto space-y-2 pr-1 my-1 max-h-60"></div>

      <div class="pt-3 border-t border-slate-800 flex items-center justify-end gap-2 shrink-0">
        <button id="btnCancelQuickPaste" class="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-xl">ปิดหน้าต่าง</button>
      </div>
    </div>
  </div>

  <!-- Modal: AI Vision Raid Check (เช็คว่ากิลไหนลงไปแล้วจากรูป) -->
  <div id="aiRaidCheckModal" class="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 hidden overflow-y-auto">
    <div class="bg-[#0b101d] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl relative my-auto">
      <div class="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-gradient-to-r from-[#0d1424] to-[#121b33]">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-md flex items-center justify-center">
            <div class="w-full h-full bg-[#080c16] rounded-[10px] flex items-center justify-center">
              <i class="fa-solid fa-camera text-indigo-400"></i>
            </div>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-base font-bold text-white">AI ถามสถานะเรดจากรูปภาพ</h3>
              <span class="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-full font-medium">Gemini 3.8 Flash</span>
            </div>
            <p class="text-xs text-slate-400 mt-0.5">ส่งรูปแคปหน้าจอเพื่อถามว่า "กิลไหนลงไปแล้วบ้าง" ระบบจะสแกนและตรวจสอบให้ทันที</p>
          </div>
        </div>
        <button id="btnCloseAiModal" class="text-slate-400 hover:text-white p-1.5 rounded-lg transition-colors">
          <i class="fa-solid fa-xmark text-lg"></i>
        </button>
      </div>

      <div class="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
        <div id="aiUploadZone" class="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 text-center cursor-pointer bg-[#070b16] transition-all">
          <input type="file" id="aiFileInput" accept="image/*" class="hidden">
          <div class="w-12 h-12 mx-auto rounded-xl bg-indigo-950/70 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3">
            <i class="fa-solid fa-cloud-arrow-up text-xl"></i>
          </div>
          <p class="text-sm font-semibold text-white">คลิกเพื่อเลือกภาพ หรือลากไฟล์มาวางที่นี่</p>
          <p class="text-slate-400 mt-1">หรือกด <kbd class="px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-indigo-300 font-mono">Ctrl + V</kbd> เพื่อวางภาพแคปหน้าจอได้ทันที</p>
        </div>

        <div id="aiPreviewZone" class="hidden space-y-3">
          <div class="relative rounded-xl overflow-hidden bg-black/60 border border-slate-800 flex items-center justify-center max-h-52">
            <img id="aiImgPreview" src="" alt="Raid screen" class="max-h-52 object-contain w-auto rounded-lg">
            <button id="btnAiChangeImg" class="absolute top-2 right-2 px-2.5 py-1 bg-slate-900/90 hover:bg-rose-950 text-slate-300 hover:text-rose-200 border border-slate-700 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-colors">
              <i class="fa-solid fa-rotate-left"></i>
              <span>เปลี่ยนรูป</span>
            </button>
          </div>

          <div>
            <label class="block text-slate-300 font-semibold mb-1.5">คำถามที่ต้องการให้ AI วิเคราะห์:</label>
            <div class="flex gap-2">
              <input type="text" id="aiQuestionInput" value="กิลไหนลงไปแล้วบ้างจากรูปนี้?" class="flex-1 bg-[#070b16] border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs">
              <button id="btnRunAiCheck" class="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md">
                <i class="fa-solid fa-wand-magic-sparkles text-amber-300"></i>
                <span>วิเคราะห์ภาพ</span>
              </button>
            </div>
          </div>
        </div>

        <div id="aiLoadingIndicator" class="hidden p-5 rounded-2xl bg-[#090f1e] border border-indigo-500/30 text-center space-y-2">
          <div class="w-8 h-8 mx-auto border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <p class="text-sm font-bold text-white">AI กำลังอ่านและเปรียบเทียบกับรายชื่อกิลด์...</p>
          <p class="text-xs text-slate-400">กำลังตรวจจับชื่อกิลด์และสถานะการลงเรดจากรูปภาพ</p>
        </div>

        <div id="aiResultArea" class="hidden space-y-3.5">
          <div class="p-3.5 bg-gradient-to-r from-indigo-950/60 via-[#0d152b] to-purple-950/40 border border-indigo-500/40 rounded-xl space-y-2">
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-sparkles text-amber-400"></i>
              <span class="font-bold text-sm text-white">ผลการวิเคราะห์จาก AI:</span>
            </div>
            <p id="aiSummaryText" class="text-xs text-slate-200 leading-relaxed font-sans"></p>
          </div>

          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="font-semibold text-slate-300 text-xs">กิลด์ที่ตรวจพบ:</span>
              <button id="btnAiApplyAll" class="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors">
                <i class="fa-solid fa-circle-check"></i>
                <span>ปรับสถานะตาม AI ให้ทุกกิลด์ทันที</span>
              </button>
            </div>
            <div id="aiDetectedGrid" class="grid grid-cols-1 sm:grid-cols-2 gap-2.5"></div>
          </div>
        </div>
      </div>

      <div class="p-4 border-t border-slate-800 flex items-center justify-between shrink-0 bg-[#070b16]">
        <span class="text-[11px] text-slate-500">กด Ctrl+V เพื่อวางรูปภาพได้ทันที</span>
        <button id="btnAiCloseBottom" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold">ปิด</button>
      </div>
    </div>
  </div>

  <!-- Toast Container -->
  <div id="toastContainer" class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"></div>

  <!-- App Logic -->
  <script src="app.js"><\/script>
</body>
</html>
`;
export const STANDALONE_HTML = STANDALONE_INDEX_HTML;

export const STANDALONE_APP_JS = `/**
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
      cycleLabel.textContent = \`รอบปัจจุบัน: \${formatCycleDateString(cycleInfo.cycleStartThai)}\`;
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
    content = \`<img src="\${customImage}" alt="Emblem" class="w-full h-full object-cover rounded-[10px]">\`;
  } else {
    switch (icon) {
      case 'dragon':
        content = \`<div class="absolute inset-0 bg-gradient-to-tr from-red-600/20 via-transparent to-transparent pointer-events-none"></div><svg viewBox="0 0 24 24" fill="none" class="w-full h-full text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]" stroke="currentColor" stroke-width="1.8"><path d="M12 2C6.5 2 2 6.5 2 12c0 3.5 1.8 6.6 4.5 8.4-.2-1.8.4-3.7 1.8-5.1 1.7-1.7 4.2-2.1 6.3-1.1-.9-1.2-1.3-2.7-1.1-4.2.4-2.8 2.8-4.9 5.6-4.9 1.4 0 2.6.5 3.6 1.4-.4-3.7-3.5-6.5-7.7-6.5z" fill="currentColor" fill-opacity="0.85"/><circle cx="19" cy="10" r="1.5" fill="#fca5a5"/></svg>\`;
        break;
      case 'lion':
        content = \`<div class="absolute inset-0 bg-gradient-to-tr from-cyan-600/20 via-transparent to-transparent pointer-events-none"></div><svg viewBox="0 0 24 24" fill="none" class="w-full h-full text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]" stroke="currentColor" stroke-width="1.8"><path d="M12 3a9 9 0 0 0-9 9c0 3.8 2.4 7 5.8 8.3-.3-1.4.1-3 1.2-4.1 1.2-1.2 3-1.6 4.6-.9-.6-.9-.8-2-.6-3.1.3-2 1.9-3.5 3.9-3.5 1 0 1.8.3 2.5 1-.2-3.8-3.4-6.7-7.4-6.7z" fill="currentColor" fill-opacity="0.85"/><circle cx="16" cy="9" r="1.5" fill="#a5f3fc"/><path d="M8 14c1 1 2.5 1.5 4 1" stroke="#a5f3fc" stroke-width="2" stroke-linecap="round"/></svg>\`;
        break;
      case 'crows':
        content = \`<div class="absolute inset-0 bg-gradient-to-tr from-amber-600/20 via-transparent to-transparent pointer-events-none"></div><svg viewBox="0 0 24 24" fill="none" class="w-full h-full text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.7)]" stroke="currentColor" stroke-width="1.8"><path d="M12 2a5 5 0 0 0-5 5v3c0 2 1.5 3.5 3.5 4H8l-3 4h14l-3-4h-2.5c2-.5 3.5-2 3.5-4V7a5 5 0 0 0-5-5z" fill="currentColor" fill-opacity="0.85"/><circle cx="10" cy="7" r="1" fill="#fef3c7"/><circle cx="14" cy="7" r="1" fill="#fef3c7"/><path d="M9 18l3 4 3-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>\`;
        break;
      case 'devil':
        content = \`<div class="absolute inset-0 bg-gradient-to-tr from-rose-600/20 via-transparent to-transparent pointer-events-none"></div><svg viewBox="0 0 24 24" fill="none" class="w-full h-full text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.7)]" stroke="currentColor" stroke-width="1.8"><path d="M4 6c0 5 3 13 8 16 5-3 8-11 8-16-3 1-6 0-8-2-2 2-5 3-8 2z" fill="currentColor" fill-opacity="0.85"/><path d="M9 11l2 2-2 2M15 11l-2 2 2 2" stroke="#ffe4e6" stroke-width="2" stroke-linecap="round"/><path d="M8 4l2 3M16 4l-2 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>\`;
        break;
      default:
        content = \`<i class="fa-solid fa-shield text-indigo-400 text-xl"></i>\`;
    }
  }

  if (guildId) {
    return \`
      <div onclick="openChangePictureModal('\${guildId}')" class="relative cursor-pointer group/avatar shrink-0" title="คลิกเพื่อเปลี่ยนรูป หรือชี้แล้วกด Ctrl+V เพื่อวางรูปภาพ">
        <div class="w-13 h-13 rounded-xl bg-[#121624] border border-indigo-500/40 p-0.5 shadow-md relative overflow-hidden flex items-center justify-center shrink-0 transition-transform group-hover/avatar:scale-105">
          \${content}
        </div>
        <div class="absolute inset-0 bg-slate-950/70 backdrop-blur-[1px] rounded-xl opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
          <i class="fa-solid fa-camera text-indigo-300 text-sm"></i>
          <span class="text-[9px] font-semibold text-indigo-200 mt-0.5 leading-none">Ctrl+V</span>
        </div>
        \${customImage ? '<div class="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full border-2 border-[#0b101d]"></div>' : ''}
      </div>
    \`;
  }

  return \`<div class="w-13 h-13 rounded-xl bg-[#121624] border border-indigo-500/40 p-0.5 shadow-md relative overflow-hidden flex items-center justify-center shrink-0">\${content}</div>\`;
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
      <div
        onmouseenter="setHoveredGuild('\${g.id}')"
        onmouseleave="clearHoveredGuild('\${g.id}')"
        ondragover="event.preventDefault()"
        ondrop="handleCardDrop(event, '\${g.id}')"
        class="rounded-2xl p-4 sm:p-5 transition-all duration-200 relative flex flex-col justify-between group \${cardClass}">
        <div>
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              \${getAvatarSvg(g.avatarIcon, g.customImage, g.id)}
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <h3 class="text-base sm:text-lg font-bold text-white tracking-wide uppercase font-chakra">
                    \${escapeHtml(g.name)}
                  </h3>
                  \${isBeaten ? '<span class="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">ตีแล้ว</span>' : ''}
                </div>
                <div class="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <div class="flex items-center gap-1">
                    <i class="fa-solid fa-user-group text-slate-500 text-[10px]"></i>
                    <span>\${g.level ? \`Lv.\${g.level}\` : 'ไม่ระบุเลเวล'}</span>
                  </div>
                  <button type="button" onclick="openChangePictureModal('\${g.id}')" class="text-[11px] text-indigo-400 hover:text-indigo-300 underline opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 cursor-pointer">
                    <i class="fa-solid fa-camera text-[10px]"></i>
                    <span>เปลี่ยนรูป (Ctrl+V)</span>
                  </button>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-1">
              <button onclick="openChangePictureModal('\${g.id}')" class="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer" title="เปลี่ยนรูปภาพ (Ctrl+V)">
                <i class="fa-solid fa-camera text-sm"></i>
              </button>
              <button onclick="openEditGuild('\${g.id}')" class="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer" title="แก้ไข">
                <i class="fa-solid fa-pen text-sm"></i>
              </button>
            </div>
          </div>

          <div class="mt-3.5 flex items-center gap-2 flex-wrap">
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
          showToast(\`เปลี่ยนรูปภาพของกิลด์ "\${target.name}" สำเร็จแล้ว! 🎉 (จาก Ctrl+V)\`, "success");
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
      showToast(\`เปลี่ยนรูปภาพของกิลด์ "\${target?.name || ''}" สำเร็จแล้ว! 📸\`, "success");
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

  document.getElementById("cpGuildName").textContent = \`เปลี่ยนรูปกิลด์: \${g.name}\`;
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
    container.innerHTML = \`<img src="\${base64}" alt="Preview" class="w-18 h-18 rounded-xl object-cover border border-indigo-500/50 shadow-md">\`;
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
    thumb.innerHTML = \`<img src="\${base64}" alt="Pasted" class="w-full h-full object-cover rounded-[10px]">\`;
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
    container.innerHTML = \`<div class="text-center py-6 text-xs text-slate-500">ไม่พบกิลด์ที่ตรงกับคำค้นหา</div>\`;
    return;
  }

  container.innerHTML = filtered.map(g => \`
    <div onclick="applyQuickPasteToGuild('\${g.id}')" class="flex items-center justify-between p-2.5 rounded-xl bg-[#090e1c] hover:bg-[#131b2f] border border-slate-800/80 hover:border-indigo-500/50 transition-all cursor-pointer group">
      <div class="flex items-center gap-3">
        \${getAvatarSvg(g.avatarIcon, g.customImage)}
        <div>
          <div class="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">\${escapeHtml(g.name)}</div>
          <div class="text-[11px] text-slate-400">\${g.level ? \`Lv.\${g.level}\` : 'ไม่ระบุเลเวล'} • \${g.status === 'beaten' ? 'ตีแล้ว' : 'ยังไม่ได้ตี'}</div>
        </div>
      </div>
      <button type="button" class="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-950/70 text-indigo-300 border border-indigo-500/30 group-hover:bg-indigo-600 group-hover:text-white transition-all flex items-center gap-1.5">
        <i class="fa-solid fa-check text-xs"></i>
        <span>เปลี่ยนเป็นรูปนี้</span>
      </button>
    </div>
  \`).join("");
}

window.applyQuickPasteToGuild = function(guildId) {
  if (!state.activeQpImage) return;
  const target = state.guilds.find(g => g.id === guildId);
  const updated = state.guilds.map(g =>
    g.id === guildId ? { ...g, customImage: state.activeQpImage, updatedAt: Date.now() } : g
  );
  saveDataToDatabase(updated);
  closeQuickPasteModal();
  showToast(\`เปลี่ยนรูปภาพของกิลด์ "\${target?.name || ''}" เรียบร้อย! 🎉\`, "success");
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
      previewBox.innerHTML = \`<img src="\${base64}" alt="Preview" class="w-full h-full object-cover rounded-[10px]">\`;
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
    showToast(\`อัปเดตรูปภาพของ "\${target?.name || ''}" สำเร็จแล้ว! 🎉\`, "success");
  });

  // Quick Paste Modal Events
  document.getElementById("btnCloseQuickPasteModal")?.addEventListener("click", closeQuickPasteModal);
  document.getElementById("btnCancelQuickPaste")?.addEventListener("click", closeQuickPasteModal);
  document.getElementById("qpSearchInput")?.addEventListener("input", (e) => {
    renderQuickPasteGuildList(e.target.value);
  });

  // AI Raid Check Modal Events
  const aiModal = document.getElementById("aiRaidCheckModal");
  const aiUploadZone = document.getElementById("aiUploadZone");
  const aiPreviewZone = document.getElementById("aiPreviewZone");
  const aiFileInput = document.getElementById("aiFileInput");
  const aiImgPreview = document.getElementById("aiImgPreview");
  const aiLoadingIndicator = document.getElementById("aiLoadingIndicator");
  const aiResultArea = document.getElementById("aiResultArea");
  let currentAiImageBase64 = null;
  let currentAiDetectedResult = null;

  function openAiModal(initialBase64) {
    if (!aiModal) return;
    aiModal.classList.remove("hidden");
    if (initialBase64) {
      setAiModalImage(initialBase64);
    } else {
      resetAiModal();
    }
  }

  function closeAiModal() {
    if (!aiModal) return;
    aiModal.classList.add("hidden");
  }

  function resetAiModal() {
    currentAiImageBase64 = null;
    currentAiDetectedResult = null;
    if (aiUploadZone) aiUploadZone.classList.remove("hidden");
    if (aiPreviewZone) aiPreviewZone.classList.add("hidden");
    if (aiLoadingIndicator) aiLoadingIndicator.classList.add("hidden");
    if (aiResultArea) aiResultArea.classList.add("hidden");
  }

  function setAiModalImage(base64) {
    currentAiImageBase64 = base64;
    currentAiDetectedResult = null;
    if (aiUploadZone) aiUploadZone.classList.add("hidden");
    if (aiPreviewZone) aiPreviewZone.classList.remove("hidden");
    if (aiImgPreview) aiImgPreview.src = base64;
    if (aiLoadingIndicator) aiLoadingIndicator.classList.add("hidden");
    if (aiResultArea) aiResultArea.classList.add("hidden");
  }

  document.getElementById("btnAiSearchPhoto")?.addEventListener("click", () => openAiModal());
  document.getElementById("btnCloseAiModal")?.addEventListener("click", closeAiModal);
  document.getElementById("btnAiCloseBottom")?.addEventListener("click", closeAiModal);

  aiUploadZone?.addEventListener("click", () => aiFileInput?.click());
  aiFileInput?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setAiModalImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  });

  document.getElementById("btnAiChangeImg")?.addEventListener("click", () => resetAiModal());

  document.getElementById("btnRunAiCheck")?.addEventListener("click", async () => {
    if (!currentAiImageBase64) {
      showToast("กรุณาเลือกรูปภาพก่อนวิเคราะห์", "warning");
      return;
    }

    const question = document.getElementById("aiQuestionInput")?.value || "กิลไหนลงไปแล้วบ้างจากรูปนี้?";
    if (aiLoadingIndicator) aiLoadingIndicator.classList.remove("hidden");
    if (aiResultArea) aiResultArea.classList.add("hidden");

    try {
      const res = await fetch("/api/ai/check-raid-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: currentAiImageBase64,
          userQuestion: question,
          guilds: state.guilds,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "เกิดข้อผิดพลาดในการวิเคราะห์");
      }

      currentAiDetectedResult = json.data;
      if (aiLoadingIndicator) aiLoadingIndicator.classList.add("hidden");
      if (aiResultArea) aiResultArea.classList.remove("hidden");

      const summaryEl = document.getElementById("aiSummaryText");
      if (summaryEl) summaryEl.textContent = json.data.summary || "ตรวจสอบเสร็จสิ้น";

      const gridEl = document.getElementById("aiDetectedGrid");
      if (gridEl) {
        const detected = json.data.detectedGuilds || [];
        if (detected.length === 0) {
          gridEl.innerHTML = \`<div class="col-span-2 text-center text-slate-400 p-3">ไม่พบชื่อกิลด์ในระบบที่ปรากฏในรูปภาพ</div>\`;
        } else {
          gridEl.innerHTML = detected.map(dg => {
            const isBeaten = dg.detectedStatus === "beaten";
            return \`
              <div class="p-3 rounded-xl border \${isBeaten ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200' : 'bg-amber-950/20 border-amber-500/30 text-amber-200'}">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-white text-sm">\${escapeHtml(dg.guildName)}</span>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold border \${isBeaten ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'}">
                    \${isBeaten ? '✓ ตีแล้ว / ลงแล้ว' : '○ ยังไม่ได้ลง'}
                  </span>
                </div>
                <p class="text-[11px] text-slate-300 mt-1">\${escapeHtml(dg.details)}</p>
              </div>
            \`;
          }).join("");
        }
      }
    } catch (err) {
      if (aiLoadingIndicator) aiLoadingIndicator.classList.add("hidden");
      showToast(err.message || "ไม่สามารถวิเคราะห์ภาพได้", "warning");
    }
  });

  document.getElementById("btnAiApplyAll")?.addEventListener("click", () => {
    if (!currentAiDetectedResult || !currentAiDetectedResult.detectedGuilds) return;
    const detected = currentAiDetectedResult.detectedGuilds;
    let count = 0;
    const updated = state.guilds.map(g => {
      const match = detected.find(d =>
        d.guildName.toLowerCase().trim() === g.name.toLowerCase().trim() ||
        g.name.toLowerCase().includes(d.guildName.toLowerCase())
      );
      if (match && (match.detectedStatus === 'beaten' || match.detectedStatus === 'unbeaten')) {
        count++;
        return {
          ...g,
          status: match.detectedStatus,
          beatenAt: match.detectedStatus === 'beaten' ? Date.now() : null,
          updatedAt: Date.now(),
        };
      }
      return g;
    });

    if (count > 0) {
      saveDataToDatabase(updated);
      showToast(\`อัปเดตสถานะเรดให้ \${count} กิลด์ตาม AI สำเร็จ! 🎉\`, "success");
      closeAiModal();
    } else {
      showToast("ไม่พบกิลด์ในระบบที่ตรงกับในรูปภาพ", "warning");
    }
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
      showToast(\`อัปเดตข้อมูล \${name} สำเร็จ\`, "success");
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
      showToast(\`เพิ่มกิลด์ "\${name}" สำเร็จ\`, "success");
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

  let text = \`🛡️ [สรุปสถานะเรดแคลน กิลด์รอง KKop]\n\`;
  text += \`📅 \${dateStr}\n\`;
  text += \`------------------------------------\n\`;
  text += \`⚔️ ตีแล้วเรียบร้อย: \${beaten.length}/\${total} กิลด์\n\`;
  text += \`⏳ ยังไม่ได้ตี: \${unbeaten.length} กิลด์\n\`;
  text += \`------------------------------------\n\n\`;

  if (unbeaten.length > 0) {
    text += \`⚠️ กิลด์ที่ยังไม่ได้ตี (\${unbeaten.length}):\n\`;
    unbeaten.forEach((g, idx) => {
      const lvStr = g.level ? \`Lv.\${g.level}\` : 'ไม่ระบุ Lv.';
      const dropStr = g.dropType === 'inventory' ? 'ของเข้าตัว' : g.dropType === 'guild' ? 'เข้ากิล' : \`อื่นๆ (\${g.dropNote || '-'})\`;
      text += \` \${idx + 1}. \${g.name} (\${lvStr}) - \${dropStr}\n\`;
    });
    text += \`\n\`;
  }

  if (beaten.length > 0) {
    text += \`✅ กิลด์ที่ตีแล้ว (\${beaten.length}):\n\`;
    beaten.forEach((g) => {
      text += \` • \${g.name} (\${g.level ? \`Lv.\${g.level}\` : 'ไม่ระบุ Lv.'})\n\`;
    });
  }

  text += \`\n⏰ รีเซ็ตรอบถัดไป: วันพุธ เวลา 05:00 น. (UTC+7)\`;

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
export const STANDALONE_JS = STANDALONE_APP_JS;

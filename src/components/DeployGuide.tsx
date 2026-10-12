import React from 'react';
import { Rocket, Database, Globe, CheckCircle2, ShieldAlert, Terminal, Layers } from 'lucide-react';

export const DeployGuide: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-500/30 rounded-2xl p-5 shadow-xl">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Rocket className="w-5 h-5 text-indigo-400" />
          <span>คู่มือการใช้งาน: ทุกคนเข้าได้เลยไม่ต้องขออนุญาต & ลิ้งก์ข้อมูลกันทั้งหมด</span>
        </h2>
        <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
          ระบบนี้เปิดให้ทุกคนที่มีลิงก์เข้าถึงได้ทันที 100% <strong>โดยไม่ต้องลงทะเบียน, ไม่ต้องล็อกอิน, และไม่ต้องกดขอสิทธิ์อนุญาตใดๆ</strong> เมื่อสมาชิกคนใดคนหนึ่งกดติ๊ก "ตีแล้ว" หรือวางรูปภาพ ทุกคนจะเห็นอัปเดตตรงกันทันทีแบบเรียลไทม์
        </p>
      </div>

      {/* Zero Permission & Full Realtime Sync Highlight Card */}
      <div className="bg-[#0b1325] border border-emerald-500/40 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>ทำไมทุกคนเข้าได้เลยโดยไม่ต้องขออนุญาต?</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
          <div className="p-3 rounded-xl bg-[#070c18] border border-slate-800 space-y-1.5">
            <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
              <span>🌐 เมื่อเปิดผ่านลิงก์แอปปัจจุบัน:</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              เซิร์ฟเวอร์เปิดช่องทาง Real-time SSE (<code className="text-indigo-300">/api/events</code>) ไว้แบบสาธารณะ สมาชิกกิลด์ทุกคนที่เปิดลิงก์จะเชื่อมต่อเข้าห้องเดียวกันทันที แก้ไขข้อมูลปุ๊บ ทุกคนเห็นพร้อมกันใน 0.1 วินาที
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#070c18] border border-slate-800 space-y-1.5">
            <div className="font-semibold text-amber-300 flex items-center gap-1.5">
              <span>🔥 เมื่อนำไฟล์ไปใช้กับ Firebase Realtime Database:</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              กำหนด Security Rules เป็น <code className="text-amber-300 font-mono">.read: true, .write: true</code> ทำให้ใครก็ตามที่มีลิงก์เว็บ สามารถเปิดอ่านและบันทึกได้ทันทีโดยไม่ต้องร้องขอสิทธิ์
            </p>
          </div>
        </div>
      </div>

      {/* Step 1: File Setup */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex items-center gap-2 text-white font-semibold text-sm">
          <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs">
            1
          </span>
          <span>การเตรียมไฟล์ในคอมพิวเตอร์</span>
        </div>
        <p className="text-xs text-slate-400">
          สร้างโฟลเดอร์ใหม่ เช่น <code className="text-amber-300 bg-slate-950 px-1.5 py-0.5 rounded font-mono">kkop-guild-raid</code> แล้วนำ 2 ไฟล์ที่ดาวน์โหลดไปวางไว้คู่กัน:
        </p>
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-slate-300">
          📁 kkop-guild-raid/<br />
          &nbsp;&nbsp;├── 📄 index.html &nbsp;&nbsp;<span className="text-slate-500">(หน้าเว็บ UI + Tailwind CDN)</span><br />
          &nbsp;&nbsp;└── 📄 app.js &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-500">(ระบบคำนวณ + Firebase + รีเซ็ตพุธ 05:00 น.)</span>
        </div>
        <p className="text-xs text-emerald-400/90 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>สามารถดับเบิ้ลคลิกที่ <strong>index.html</strong> เพื่อเปิดทดสอบบน Browser (Chrome/Edge/Safari) ได้ทันที!</span>
        </p>
      </div>

      {/* Step 2: Firebase Realtime Database Setup */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center gap-2 text-white font-semibold text-sm">
          <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs">
            2
          </span>
          <span>การเชื่อมต่อ Firebase Realtime Database (ชื่อโปรเจกต์ KKop)</span>
        </div>
        <p className="text-xs text-slate-400">
          หากต้องการให้สมาชิกทุกคนในกิลด์เห็นข้อมูลอัปเดตแบบเรียลไทม์พร้อมกันผ่านเน็ต ให้ตั้งค่า Firebase ฟรีตามนี้:
        </p>

        <ol className="list-decimal list-inside space-y-2.5 text-xs text-slate-300">
          <li className="leading-relaxed">
            เข้าไปที่ <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline font-mono">Firebase Console</a> และล็อกอินด้วยบัญชี Google
          </li>
          <li className="leading-relaxed">
            กด <strong>Add project (สร้างโปรเจกต์)</strong> &rarr; ตั้งชื่อว่า <strong className="text-white">KKop</strong> (หรือ kkop-guild) แล้วกดยืนยัน
          </li>
          <li className="leading-relaxed">
            ที่เมนูด้านซ้าย เลือก <strong>Build &gt; Realtime Database</strong> &rarr; กดปุ่ม <strong>Create Database</strong>
          </li>
          <li className="leading-relaxed">
            เลือก Location เป็น <strong className="text-amber-300">Singapore (asia-southeast1)</strong> เพื่อความเร็วสูงสุดในไทย &rarr; ในหน้า Security rules ให้เลือก <strong>Start in test mode</strong>
          </li>
          <li className="leading-relaxed">
            ไปที่แท็บ <strong>Rules</strong> และกำหนดสิทธิ์ให้อ่าน/เขียนได้:
            <pre className="mt-1.5 p-2.5 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-amber-300">
{`{
  "rules": {
    ".read": true,
    ".write": true
  }
}`}
            </pre>
          </li>
          <li className="leading-relaxed">
            คัดลอก <strong>Database URL</strong> เช่น:
            <div className="mt-1 p-2 bg-slate-950 rounded-lg border border-slate-800 text-slate-200 font-mono text-[11px]">
              https://kkop-default-rtdb.asia-southeast1.firebasedatabase.app
            </div>
            นำไปใส่ในไฟล์ <code className="text-amber-300">app.js</code> ตรงตัวแปร <code className="text-amber-300">databaseURL</code> หรือกดที่ปุ่ม <strong>"ตั้งค่า Firebase"</strong> บนหน้าเว็บได้เลย
          </li>
        </ol>
      </div>

      {/* Step 3: Deployment Options */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center gap-2 text-white font-semibold text-sm">
          <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs">
            3
          </span>
          <span>วิธี Deploy ขึ้นโฮสต์ออนไลน์ฟรี (ส่งลิงก์ให้สมาชิกในกิลด์เข้าใช้)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {/* Option A: GitHub Pages */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-white font-bold text-xs">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>ทางเลือกที่ 1: GitHub Pages</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                ฟรีและง่ายที่สุด! สร้าง Repository บน GitHub นำไฟล์ <code className="text-amber-300">index.html</code> และ <code className="text-amber-300">app.js</code> อัปโหลดขึ้นไป จากนั้นไปที่ Settings &gt; Pages &gt; เลือก Branch main แล้วกด Save จะได้ลิงก์ <code className="text-emerald-400">username.github.io/repo</code> ทันที
              </p>
            </div>
            <div className="text-[10px] text-emerald-400 font-medium">แนะนำสำหรับมือใหม่ ⭐</div>
          </div>

          {/* Option B: Netlify / Vercel Drop */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-white font-bold text-xs">
                <Layers className="w-4 h-4 text-blue-400" />
                <span>ทางเลือกที่ 2: Netlify Drop</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                เข้า <a href="https://app.netlify.com/drop" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">netlify.com/drop</a> แล้วลากโฟลเดอร์ที่มีไฟล์ทั้ง 2 ไปวางในหน้าเว็บ ระบบจะสร้าง URL ให้ออนไลน์ทันทีใน 10 วินาทีโดยไม่ต้องลงทะเบียนหรือติดตั้งโปรแกรมใดๆ
              </p>
            </div>
            <div className="text-[10px] text-blue-400 font-medium">เร็วสุด ลากวางได้เลย ⚡</div>
          </div>

          {/* Option C: Firebase Hosting */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-white font-bold text-xs">
                <Database className="w-4 h-4 text-amber-400" />
                <span>ทางเลือกที่ 3: Firebase Hosting</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                ใช้คำสั่ง <code className="text-amber-300 font-mono">firebase init hosting</code> และ <code className="text-amber-300 font-mono">firebase deploy</code> ในโฟลเดอร์ เพื่อให้เว็บอยู่ใต้โดเมน <code className="text-amber-400">kkop.web.app</code> หรือผูกโดเมนตัวเองฟรี
              </p>
            </div>
            <div className="text-[10px] text-amber-400 font-medium">รวมศูนย์ในโปรเจกต์เดียวกัน 🛡️</div>
          </div>
        </div>
      </div>

      {/* Reset Logic Deep-Dive */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex items-center gap-2 text-white font-semibold text-sm">
          <Terminal className="w-4 h-4 text-amber-400" />
          <span>ระบบเช็คเวลาและการรีเซ็ตอัตโนมัติทุกวันพุธ 05:00 น. ทำงานอย่างไร?</span>
        </div>
        <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside leading-relaxed">
          <li>
            <strong>คำนวณตามเวลาไทย (UTC+7):</strong> ฟังก์ชัน <code className="text-amber-300 font-mono">getWednesdayCycleInfo()</code> จะแปลงเวลาปัจจุบันเป็นเวลาประเทศไทย แล้วตรวจสอบว่ารอบสัปดาห์เริ่มตั้งแต่วันพุธ 05:00 น. เมื่อใด
          </li>
          <li>
            <strong>กำหนด Cycle Key ประจำสัปดาห์:</strong> เช่น <code className="text-amber-300 font-mono">CYCLE_2026_10_14_0500</code> ถูกบันทึกไว้ใน Firebase Realtime Database
          </li>
          <li>
            <strong>ตรวจจับการเปลี่ยนรอบ:</strong> ใน <code className="text-amber-300 font-mono">app.js</code> จะมี Timer เช็คทุกๆ 10 วินาที เมื่อเข้าสู่วันพุธ เวลา 05:00 น. ระบบจะตรวจพบว่า Cycle Key เปลี่ยนไป และจะปรับสถานะ <code className="text-rose-400 font-mono">checkedIn = false</code>, <code className="text-rose-400 font-mono">hits = 0</code> และ <code className="text-rose-400 font-mono">damage = 0</code> ให้สมาชิกทุกคนพร้อมกันทันที
          </li>
          <li>
            <strong>ปุ่มสำรองสำหรับหัวหน้ากิลด์:</strong> หากต้องการรีเซ็ตก่อนเวลาหรือต้องการเคลียร์รอบใหม่ฉุกเฉิน สามารถกดปุ่ม <strong>"รีเซ็ตทันที"</strong> ตรงแถบนับเวลาถอยหลังได้เช่นกัน
          </li>
        </ul>
      </div>
    </div>
  );
};

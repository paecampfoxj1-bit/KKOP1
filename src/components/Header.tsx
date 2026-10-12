import React, { useState } from 'react';
import { Shield, Sparkles, Database, FileCode, Rocket, Plus, Share2, Link2, Check, Radio } from 'lucide-react';

interface HeaderProps {
  activeTab: 'tracker' | 'code' | 'deploy';
  setActiveTab: (tab: 'tracker' | 'code' | 'deploy') => void;
  isFirebaseConnected: boolean;
  isServerSyncConnected?: boolean;
  onOpenAddMember: () => void;
  onOpenExport: () => void;
  onOpenFirebase: () => void;
  onCopyShareLink?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isFirebaseConnected,
  isServerSyncConnected = true,
  onOpenAddMember,
  onOpenExport,
  onOpenFirebase,
  onCopyShareLink,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShareClick = () => {
    if (onCopyShareLink) {
      onCopyShareLink();
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const isLive = isServerSyncConnected || isFirebaseConnected;

  return (
    <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Logo & Guild Brand */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
                <div className="w-full h-full bg-[#080c16] rounded-[10px] flex items-center justify-center">
                  <Shield className="w-5 h-5 text-indigo-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold tracking-tight font-chakra text-white flex items-center gap-1.5">
                    <span>KKop</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      กิลด์รอง
                    </span>
                  </h1>
                  
                  {/* Realtime Link Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full border transition-all ${
                      isFirebaseConnected || isLive
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-xs'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}
                    title="ทุกคนเปิดลิงก์นี้แล้วเห็นข้อมูลตรงกันทันทีแบบเรียลไทม์ โดยไม่ต้องล็อกอินหรือขอสิทธิ์"
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isFirebaseConnected || isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                      }`}
                    />
                    <span className="font-medium">
                      {isFirebaseConnected
                        ? 'Firebase เรียลไทม์ (ซิงค์ทุกคนอัตโนมัติ)'
                        : isLive
                        ? 'เรียลไทม์ออนไลน์ (ลิ้งค์ข้อมูลทุกคน)'
                        : 'โหมดออฟไลน์'}
                    </span>
                  </span>
                </div>
                <p className="text-xs text-slate-400">เข้าได้ทันทีทุกคน ไม่ต้องขออนุญาต &bull; ข้อมูลซิงค์ตรงกันทุกคน</p>
              </div>
            </div>

            {/* Mobile View Add Quick Action */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={handleShareClick}
                className="p-2 bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 hover:text-white rounded-lg text-xs flex items-center justify-center cursor-pointer"
                title="คัดลอกลิงก์ให้สมาชิกเข้าใช้งาน"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Link2 className="w-4 h-4" />}
              </button>
              <button
                onClick={onOpenAddMember}
                className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm font-semibold text-xs flex items-center justify-center cursor-pointer"
                title="เพิ่มกิลด์ใหม่"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation View Tabs */}
          <div className="flex items-center p-1 bg-[#0c1220] rounded-xl border border-slate-800 text-xs w-full md:w-auto justify-center">
            <button
              onClick={() => setActiveTab('tracker')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'tracker'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>หน้าระบบเช็คเรด</span>
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'code'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>โค้ด 2 ไฟล์สำเร็จรูป</span>
            </button>
            <button
              onClick={() => setActiveTab('deploy')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'deploy'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>วิธีรัน & สิทธิ์เข้าถึง</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-2">
            {/* Share Link Button */}
            <button
              onClick={handleShareClick}
              className="px-3 py-1.5 text-xs font-medium bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/40 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="คัดลอกลิงก์ส่งให้เพื่อนในกิลด์เข้าใช้งานได้ทันที ไม่ต้องขออนุญาต"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300 font-semibold">คัดลอกลิงก์แล้ว!</span>
                </>
              ) : (
                <>
                  <Link2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>แชร์ลิงก์ให้สมาชิก</span>
                </>
              )}
            </button>

            <button
              onClick={onOpenFirebase}
              className="px-3 py-1.5 text-xs font-medium bg-[#0c1220] hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span>Firebase สถานะ</span>
            </button>

            <button
              onClick={onOpenExport}
              className="px-3 py-1.5 text-xs font-medium bg-[#0c1220] hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>สรุปส่ง LINE/Discord</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

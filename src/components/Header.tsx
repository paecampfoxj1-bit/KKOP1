import React from 'react';
import { Shield, Sparkles, Database, FileCode, Rocket, Plus, Share2 } from 'lucide-react';

interface HeaderProps {
  activeTab: 'tracker' | 'code' | 'deploy';
  setActiveTab: (tab: 'tracker' | 'code' | 'deploy') => void;
  isFirebaseConnected: boolean;
  onOpenAddMember: () => void;
  onOpenExport: () => void;
  onOpenFirebase: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isFirebaseConnected,
  onOpenAddMember,
  onOpenExport,
  onOpenFirebase,
}) => {
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
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight font-chakra text-white flex items-center gap-1.5">
                    <span>KKop</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      กิลด์รอง
                    </span>
                  </h1>
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full border transition-colors ${
                      isFirebaseConnected
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isFirebaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-indigo-400'
                      }`}
                    />
                    <span>{isFirebaseConnected ? 'Firebase Online' : 'โหมด Local'}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-400">ระบบเช็คชื่อ & บันทึกสถานะเรดแคลนแบบเรียลไทม์</p>
              </div>
            </div>

            {/* Mobile View Add Quick Action */}
            <div className="flex items-center gap-2 md:hidden">
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
              <span>วิธีรัน & Deploy</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={onOpenFirebase}
              className="px-3 py-1.5 text-xs font-medium bg-[#0c1220] hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span>ตั้งค่า Firebase</span>
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

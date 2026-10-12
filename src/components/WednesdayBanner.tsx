import React from 'react';
import { Clock, RotateCcw } from 'lucide-react';
import { WeeklyCycleInfo } from '../types';

interface WednesdayBannerProps {
  cycleInfo: WeeklyCycleInfo;
  onManualReset: () => void;
}

export const WednesdayBanner: React.FC<WednesdayBannerProps> = ({ cycleInfo, onManualReset }) => {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
      <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Reset Info */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-sm">
              <Clock className="w-4 h-4" />
            </span>
            <span className="text-sm font-semibold text-amber-300">ระบบรีเซ็ตอัตโนมัติประจำสัปดาห์</span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
              ทุกวันพุธ เวลา 05:00 น. (เวลาไทย UTC+7)
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {cycleInfo.dateLabel} &bull; <span className="text-amber-400/90 font-mono text-[11px]">{cycleInfo.cycleKey}</span>
          </p>
        </div>

        {/* Live Countdown Box */}
        <div className="flex items-center gap-2 sm:gap-3 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800 shadow-inner w-full sm:w-auto justify-between sm:justify-start">
          <div className="text-center min-w-[44px]">
            <div className="text-lg sm:text-2xl font-bold font-chakra text-amber-400">
              {String(cycleInfo.days).padStart(2, '0')}
            </div>
            <div className="text-[10px] uppercase text-slate-500 tracking-wider">วัน</div>
          </div>
          <span className="text-slate-600 font-bold">:</span>
          <div className="text-center min-w-[44px]">
            <div className="text-lg sm:text-2xl font-bold font-chakra text-white">
              {String(cycleInfo.hours).padStart(2, '0')}
            </div>
            <div className="text-[10px] uppercase text-slate-500 tracking-wider">ชั่วโมง</div>
          </div>
          <span className="text-slate-600 font-bold">:</span>
          <div className="text-center min-w-[44px]">
            <div className="text-lg sm:text-2xl font-bold font-chakra text-white">
              {String(cycleInfo.minutes).padStart(2, '0')}
            </div>
            <div className="text-[10px] uppercase text-slate-500 tracking-wider">นาที</div>
          </div>
          <span className="text-slate-600 font-bold">:</span>
          <div className="text-center min-w-[44px]">
            <div className="text-lg sm:text-2xl font-bold font-chakra text-emerald-400">
              {String(cycleInfo.seconds).padStart(2, '0')}
            </div>
            <div className="text-[10px] uppercase text-slate-500 tracking-wider">วินาที</div>
          </div>

          <button
            onClick={onManualReset}
            title="รีเซ็ตสถานะเป็นรอบใหม่ทันที (สำหรับหัวหน้ากิลด์)"
            className="ml-2 px-2.5 py-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors text-xs flex items-center gap-1 border border-transparent hover:border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">รีเซ็ตทันที</span>
          </button>
        </div>
      </div>
    </div>
  );
};

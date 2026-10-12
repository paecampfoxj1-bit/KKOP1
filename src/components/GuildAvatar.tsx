import React from 'react';
import { GuildIconType } from '../types';

interface GuildAvatarProps {
  icon: GuildIconType;
  className?: string;
}

export const GuildAvatar: React.FC<GuildAvatarProps> = ({ icon, className = 'w-12 h-12' }) => {
  switch (icon) {
    case 'dragon':
      return (
        <div className={`${className} rounded-xl bg-[#121624] border border-red-500/30 flex items-center justify-center p-1.5 shadow-md shadow-red-950/40 relative overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-tr from-red-600/20 via-transparent to-transparent pointer-events-none" />
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 2C6.5 2 2 6.5 2 12c0 3.5 1.8 6.6 4.5 8.4-.2-1.8.4-3.7 1.8-5.1 1.7-1.7 4.2-2.1 6.3-1.1-.9-1.2-1.3-2.7-1.1-4.2.4-2.8 2.8-4.9 5.6-4.9 1.4 0 2.6.5 3.6 1.4-.4-3.7-3.5-6.5-7.7-6.5z" fill="currentColor" fillOpacity="0.85"/>
            <path d="M19 12c-.5 0-1-.2-1.4-.6-.4-.4-.6-.9-.6-1.4 0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2z" fill="#fca5a5"/>
          </svg>
        </div>
      );
    case 'lion':
      return (
        <div className={`${className} rounded-xl bg-[#121624] border border-cyan-500/30 flex items-center justify-center p-1.5 shadow-md shadow-cyan-950/40 relative overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-600/20 via-transparent to-transparent pointer-events-none" />
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 3a9 9 0 0 0-9 9c0 3.8 2.4 7 5.8 8.3-.3-1.4.1-3 1.2-4.1 1.2-1.2 3-1.6 4.6-.9-.6-.9-.8-2-.6-3.1.3-2 1.9-3.5 3.9-3.5 1 0 1.8.3 2.5 1-.2-3.8-3.4-6.7-7.4-6.7z" fill="currentColor" fillOpacity="0.85"/>
            <circle cx="16" cy="9" r="1.5" fill="#a5f3fc" />
            <path d="M8 14c1 1 2.5 1.5 4 1" stroke="#a5f3fc" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      );
    case 'crows':
      return (
        <div className={`${className} rounded-xl bg-[#121624] border border-amber-500/30 flex items-center justify-center p-1.5 shadow-md shadow-amber-950/40 relative overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-600/20 via-transparent to-transparent pointer-events-none" />
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.7)]" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 2a5 5 0 0 0-5 5v3c0 2 1.5 3.5 3.5 4H8l-3 4h14l-3-4h-2.5c2-.5 3.5-2 3.5-4V7a5 5 0 0 0-5-5z" fill="currentColor" fillOpacity="0.85"/>
            <circle cx="10" cy="7" r="1" fill="#fef3c7" />
            <circle cx="14" cy="7" r="1" fill="#fef3c7" />
            <path d="M9 18l3 4 3-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      );
    case 'devil':
      return (
        <div className={`${className} rounded-xl bg-[#121624] border border-rose-500/30 flex items-center justify-center p-1.5 shadow-md shadow-rose-950/40 relative overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-tr from-rose-600/20 via-transparent to-transparent pointer-events-none" />
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.7)]" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 6c0 5 3 13 8 16 5-3 8-11 8-16-3 1-6 0-8-2-2 2-5 3-8 2z" fill="currentColor" fillOpacity="0.85"/>
            <path d="M9 11l2 2-2 2M15 11l-2 2 2 2" stroke="#ffe4e6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 4l2 3M16 4l-2 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      );
    case 'phoenix':
      return (
        <div className={`${className} rounded-xl bg-[#121624] border border-orange-500/30 flex items-center justify-center p-1.5 shadow-md shadow-orange-950/40 relative overflow-hidden`}>
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.7)]">
            <path d="M12 2C8 6 4 10 4 14a8 8 0 0 0 16 0c0-4-4-8-8-12z" fill="currentColor" fillOpacity="0.8"/>
            <path d="M12 8c-2 2-4 4-4 6a4 4 0 0 0 8 0c0-2-2-4-4-6z" fill="#ffedd5"/>
          </svg>
        </div>
      );
    case 'wolf':
      return (
        <div className={`${className} rounded-xl bg-[#121624] border border-blue-500/30 flex items-center justify-center p-1.5 shadow-md shadow-blue-950/40 relative overflow-hidden`}>
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.7)]">
            <polygon points="12 2 15 8 22 9 17 14 18 21 12 17 6 21 7 14 2 9 9 8 12 2" fill="currentColor" fillOpacity="0.85"/>
          </svg>
        </div>
      );
    case 'skull':
      return (
        <div className={`${className} rounded-xl bg-[#121624] border border-purple-500/30 flex items-center justify-center p-1.5 shadow-md shadow-purple-950/40 relative overflow-hidden`}>
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.7)]" stroke="currentColor" strokeWidth="1.8">
            <circle cx="9" cy="10" r="2" fill="currentColor"/>
            <circle cx="15" cy="10" r="2" fill="currentColor"/>
            <path d="M12 2a8 8 0 0 0-8 8c0 3 1.5 5 3 6.5V20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-3.5c1.5-1.5 3-3.5 3-6.5a8 8 0 0 0-8-8z" fill="currentColor" fillOpacity="0.8"/>
          </svg>
        </div>
      );
    default:
      return (
        <div className={`${className} rounded-xl bg-[#121624] border border-indigo-500/30 flex items-center justify-center p-1.5 shadow-md shadow-indigo-950/40 relative overflow-hidden`}>
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.7)]" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 2L3 7v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7l-9-5z" fill="currentColor" fillOpacity="0.85"/>
          </svg>
        </div>
      );
  }
};

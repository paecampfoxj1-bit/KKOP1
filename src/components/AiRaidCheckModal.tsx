import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Camera,
  Sparkles,
  Upload,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Search,
  Check,
  Send,
  Loader2,
  ShieldAlert,
  ArrowRight,
  ClipboardPaste,
  Zap,
  Filter,
} from 'lucide-react';
import { GuildRaidItem, AiRaidCheckResult, AiDetectedGuild } from '../types';

interface AiRaidCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  guilds: GuildRaidItem[];
  onApplyStatuses: (updates: { guildId: string; status: 'beaten' | 'unbeaten' }[]) => void;
  onSetSearchQuery: (query: string) => void;
  initialImage?: string;
}

const PRESET_QUESTIONS = [
  'หากิลด์ที่มีคำว่า "เข้าร่วมทันที" และดูว่ากิลไหนยังไม่ได้ลง',
  'กิลไหนลงไปแล้วบ้างจากรูปนี้?',
  'มีกิลด์ไหนในรายชื่อที่ยังไม่ได้ลงเรดบ้าง?',
  'ตรวจจับกิลด์ทั้งหมดและสถานะในรูปภาพ',
];

export const AiRaidCheckModal: React.FC<AiRaidCheckModalProps> = ({
  isOpen,
  onClose,
  guilds,
  onApplyStatuses,
  onSetSearchQuery,
  initialImage,
}) => {
  const [imagePreview, setImagePreview] = useState<string>(initialImage || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [userQuestion, setUserQuestion] = useState<string>(PRESET_QUESTIONS[0]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [result, setResult] = useState<AiRaidCheckResult | null>(null);
  const [appliedSuccess, setAppliedSuccess] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [cardFilter, setCardFilter] = useState<'all' | 'instant_join' | 'unbeaten' | 'beaten'>('all');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync initialImage if provided
  useEffect(() => {
    if (initialImage) {
      setImagePreview(initialImage);
      setResult(null);
      setErrorMsg('');
      setAppliedSuccess(false);
    }
  }, [initialImage]);

  // Handle Ctrl+V inside the modal
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            const reader = new FileReader();
            reader.onload = () => {
              if (typeof reader.result === 'string') {
                setImagePreview(reader.result);
                setSelectedFile(file);
                setResult(null);
                setErrorMsg('');
                setAppliedSuccess(false);
              }
            };
            reader.readAsDataURL(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImagePreview(reader.result);
          setSelectedFile(file);
          setResult(null);
          setErrorMsg('');
          setAppliedSuccess(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImagePreview(reader.result);
          setSelectedFile(file);
          setResult(null);
          setErrorMsg('');
          setAppliedSuccess(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!imagePreview) {
      setErrorMsg('กรุณาเลือกรูปภาพหรือกด Ctrl+V เพื่อวางรูปภาพก่อน');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setAppliedSuccess(false);

    try {
      // Send to server Gemini visual analysis endpoint
      const response = await fetch('/api/ai/check-raid-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imagePreview,
          mimeType: selectedFile?.type || 'image/png',
          userQuestion,
          guilds: guilds.map(g => ({
            id: g.id,
            name: g.name,
            level: g.level,
            status: g.status,
            dropType: g.dropType,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'เกิดข้อผิดพลาดในการวิเคราะห์รูปภาพ');
      }

      setResult(data.data);
    } catch (err: any) {
      console.error('AI Raid Check Error:', err);
      setErrorMsg(err?.message || 'ไม่สามารถติดต่อ AI เพื่อวิเคราะห์ภาพได้ในขณะนี้');
    } finally {
      setIsLoading(false);
    }
  };

  // One-click apply detected statuses to guild tracker
  const handleApplyAllDetected = () => {
    if (!result || !result.detectedGuilds) return;

    const updates: { guildId: string; status: 'beaten' | 'unbeaten' }[] = [];

    result.detectedGuilds.forEach(detected => {
      // Find matching guild in app
      const matched = guilds.find(
        g =>
          g.id === detected.guildId ||
          g.name.toLowerCase().trim() === detected.guildName.toLowerCase().trim() ||
          g.name.toLowerCase().includes(detected.guildName.toLowerCase()) ||
          detected.guildName.toLowerCase().includes(g.name.toLowerCase())
      );

      if (matched && (detected.detectedStatus === 'beaten' || detected.detectedStatus === 'unbeaten')) {
        updates.push({
          guildId: matched.id,
          status: detected.detectedStatus,
        });
      }
    });

    if (updates.length > 0) {
      onApplyStatuses(updates);
      setAppliedSuccess(true);
      setTimeout(() => setAppliedSuccess(false), 3000);
    } else {
      setErrorMsg('ไม่พบกิลด์ในระบบที่ตรงกับชื่อที่ตรวจพบในรูป');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#0b101d] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl relative my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-gradient-to-r from-[#0d1424] to-[#121b33]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-[#080c16] rounded-[10px] flex items-center justify-center">
                <Camera className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>AI ถามสถานะเรดจากรูปภาพ</span>
                </h3>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                ส่งรูปแคปหน้าจอเพื่อถามว่า <strong>"กิลไหนลงไปแล้วบ้าง"</strong> ระบบจะสแกนและตรวจสอบให้ทันที
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {/* Upload & Drop Zone */}
          {!imagePreview ? (
            <div
              onDragOver={e => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-slate-800 hover:border-indigo-500/50 bg-[#070b16] hover:bg-[#090f1e]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-950/70 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3 shadow-sm">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-white">คลิกเพื่อเลือกภาพ หรือลากไฟล์มาวางที่นี่</p>
              <p className="text-slate-400 mt-1">
                หรือกด <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-indigo-300 font-mono">Ctrl + V</kbd> เพื่อวางภาพแคปหน้าจอได้ทันที
              </p>
              <div className="flex items-center justify-center gap-2 mt-4 text-[11px] text-slate-500">
                <span>รองรับรูปภาพการตีเรด</span>
                <span>&bull;</span>
                <span>ตารางคะแนน</span>
                <span>&bull;</span>
                <span>หน้าจอเลือกกิลด์</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Image Preview Card */}
              <div className="relative rounded-xl overflow-hidden bg-black/60 border border-slate-800 flex items-center justify-center max-h-56">
                <img
                  src={imagePreview}
                  alt="Raid capture preview"
                  className="max-h-56 object-contain w-auto rounded-lg shadow-md"
                />
                <button
                  onClick={() => {
                    setImagePreview('');
                    setSelectedFile(null);
                    setResult(null);
                  }}
                  className="absolute top-2 right-2 px-2.5 py-1 bg-slate-900/90 hover:bg-rose-950/90 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-500/40 rounded-lg text-[11px] font-medium flex items-center gap-1 backdrop-blur-xs transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>เปลี่ยนรูปใหม่</span>
                </button>
              </div>

              {/* Question Selection */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                  <span>คำถามที่ต้องการให้ AI วิเคราะห์:</span>
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {PRESET_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setUserQuestion(q)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                        userQuestion === q
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                          : 'bg-[#080d1a] border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userQuestion}
                    onChange={e => setUserQuestion(e.target.value)}
                    placeholder="พิมพ์คำถามเพิ่มเติม เช่น กิลด์ Crows มีดาเมจเท่าไหร่ หรือลงไปกี่รอบ..."
                    className="flex-1 bg-[#070b16] border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
                  />
                  <button
                    onClick={handleAnalyze}
                    disabled={isLoading}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30 cursor-pointer whitespace-nowrap"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>กำลังวิเคราะห์...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>วิเคราะห์ภาพ</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Loading Animation Card */}
          {isLoading && (
            <div className="p-5 rounded-2xl bg-[#090f1e] border border-indigo-500/30 text-center space-y-3">
              <div className="relative w-12 h-12 mx-auto flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                <Sparkles className="w-5 h-5 text-indigo-400 absolute" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">AI กำลังอ่านและเปรียบเทียบกับรายชื่อกิลด์...</p>
                <p className="text-xs text-slate-400 mt-1">
                  กำลังตรวจจับชื่อกิลด์, เลเวล, และสถานะการลงเรดจากรูปภาพ
                </p>
              </div>
            </div>
          )}

          {/* AI Result Card */}
          {result && !isLoading && (
            <div className="space-y-3.5 pt-1">
              {/* Summary Banner */}
              <div className="p-3.5 bg-gradient-to-r from-indigo-950/60 via-[#0d152b] to-purple-950/40 border border-indigo-500/40 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-bold text-sm text-white">ผลการวิเคราะห์จาก AI:</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {result.summary}
                </p>
                {result.advice && (
                  <p className="text-[11px] text-indigo-300/90 italic border-t border-indigo-500/20 pt-1.5 mt-1.5">
                    💡 {result.advice}
                  </p>
                )}
              </div>

              {/* Special Section: Guilds with 'เข้าร่วมทันที' */}
              {((result.guildsWithJoinButton && result.guildsWithJoinButton.length > 0) ||
                result.detectedGuilds?.some(g => g.hasInstantJoinButton)) && (
                <div className="p-3 bg-violet-950/30 border border-violet-500/40 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-violet-200 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-violet-400" />
                      <span>กิลด์ที่พบคำว่า "เข้าร่วมทันที" (ยังไม่ได้ลงเรด):</span>
                    </span>
                    <span className="text-[10px] bg-violet-500/20 text-violet-300 border border-violet-500/40 px-2 py-0.5 rounded-full font-bold">
                      {result.guildsWithJoinButton?.length ||
                        result.detectedGuilds?.filter(g => g.hasInstantJoinButton).length}{' '}
                      กิลด์
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(
                      result.guildsWithJoinButton ||
                      result.detectedGuilds
                        .filter(g => g.hasInstantJoinButton)
                        .map(g => g.guildName)
                    ).map((name, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-violet-900/40 border border-violet-500/50 rounded-lg text-xs font-semibold text-violet-100 shadow-xs"
                      >
                        <Zap className="w-3 h-3 text-amber-300" />
                        <span>{name}</span>
                        <span className="text-[10px] text-violet-300/80 font-normal">
                          (ยังไม่ได้ลง)
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Comparison Boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* Unbeaten Guilds */}
                <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                      <span>กิลด์ที่ยังไม่ได้ลงเรด ({result.unbeatenRemaining?.length || result.detectedGuilds?.filter(g => g.detectedStatus === 'unbeaten').length || 0}):</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(result.unbeatenRemaining || result.detectedGuilds?.filter(g => g.detectedStatus === 'unbeaten').map(g => g.guildName))?.map((name, i) => (
                      <span key={i} className="px-2 py-0.5 bg-amber-950/60 border border-amber-500/40 text-amber-200 text-[11px] rounded-md font-medium">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Beaten Guilds */}
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>กิลด์ที่ลงไปแล้ว ({result.beatenGuilds?.length || result.detectedGuilds?.filter(g => g.detectedStatus === 'beaten').length || 0}):</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(result.beatenGuilds || result.detectedGuilds?.filter(g => g.detectedStatus === 'beaten').map(g => g.guildName))?.map((name, i) => (
                      <span key={i} className="px-2 py-0.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-[11px] rounded-md font-medium">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Detected Guilds Grid */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-slate-400 text-xs mr-1">กรองดู:</span>
                    <button
                      type="button"
                      onClick={() => setCardFilter('all')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                        cardFilter === 'all'
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-[#080d1a] border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      ทั้งหมด ({result.detectedGuilds?.length || 0})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCardFilter('instant_join')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                        cardFilter === 'instant_join'
                          ? 'bg-violet-600 text-white border-violet-500'
                          : 'bg-[#080d1a] border-slate-800 text-violet-300 hover:text-white'
                      }`}
                    >
                      ⚡ มีคำว่า "เข้าร่วมทันที" ({result.detectedGuilds?.filter(g => g.hasInstantJoinButton).length || 0})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCardFilter('unbeaten')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                        cardFilter === 'unbeaten'
                          ? 'bg-amber-600 text-white border-amber-500'
                          : 'bg-[#080d1a] border-slate-800 text-amber-300 hover:text-white'
                      }`}
                    >
                      ยังไม่ได้ลง ({result.detectedGuilds?.filter(g => g.detectedStatus === 'unbeaten').length || 0})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCardFilter('beaten')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                        cardFilter === 'beaten'
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-[#080d1a] border-slate-800 text-emerald-300 hover:text-white'
                      }`}
                    >
                      ลงแล้ว ({result.detectedGuilds?.filter(g => g.detectedStatus === 'beaten').length || 0})
                    </button>
                  </div>

                  {result.detectedGuilds?.length > 0 && (
                    <button
                      onClick={handleApplyAllDetected}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm self-start sm:self-auto"
                    >
                      {appliedSuccess ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>อัปเดตสถานะแล้ว!</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>ปรับสถานะตาม AI ให้ทุกกิลด์ทันที</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {result.detectedGuilds?.length === 0 ? (
                  <div className="p-4 rounded-xl bg-[#080d1a] border border-slate-800 text-center text-slate-400">
                    ไม่พบชื่อกิลด์ในระบบที่ปรากฏชัดเจนในภาพ ลองเปลี่ยนภาพแคปหน้าจอที่สว่างและเห็นตัวอักษรชัดเจน
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {result.detectedGuilds
                      .filter(dg => {
                        if (cardFilter === 'instant_join') return dg.hasInstantJoinButton;
                        if (cardFilter === 'unbeaten') return dg.detectedStatus === 'unbeaten';
                        if (cardFilter === 'beaten') return dg.detectedStatus === 'beaten';
                        return true;
                      })
                      .map((dg: AiDetectedGuild, index: number) => {
                        const isBeaten = dg.detectedStatus === 'beaten';
                        return (
                          <div
                            key={index}
                            className={`p-3 rounded-xl border transition-all ${
                              dg.hasInstantJoinButton
                                ? 'bg-violet-950/20 border-violet-500/40 shadow-xs'
                                : isBeaten
                                ? 'bg-emerald-950/20 border-emerald-500/30'
                                : 'bg-amber-950/20 border-amber-500/30'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1.5">
                              <div>
                                <span className="font-bold text-sm text-white block">
                                  {dg.guildName}
                                </span>
                                {dg.hasInstantJoinButton && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-violet-300 bg-violet-500/20 border border-violet-500/40 px-2 py-0.5 rounded-md mt-1">
                                    <Zap className="w-3 h-3 text-amber-300" />
                                    <span>มีคำว่า "เข้าร่วมทันที"</span>
                                  </span>
                                )}
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${
                                  isBeaten
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                }`}
                              >
                                {isBeaten ? '✓ ตีแล้ว / ลงแล้ว' : '○ ยังไม่ได้ลง'}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-300 mt-2 leading-snug">
                              {dg.details}
                            </p>

                            <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between">
                              <span>ความมั่นใจ: {dg.confidence || 'high'}</span>
                              <button
                                onClick={() => {
                                  onSetSearchQuery(dg.guildName);
                                  onClose();
                                }}
                                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium cursor-pointer"
                              >
                                <span>ค้นหาในหน้าหลัก</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Unbeaten Remaining (if reported) */}
              {result.unbeatenRemaining && result.unbeatenRemaining.length > 0 && (
                <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
                  <span className="text-[11px] text-slate-400 block mb-1">
                    กิลด์ในระบบที่ยังไม่ได้ลงเรด:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.unbeatenRemaining.map((gName, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded-md text-[11px] text-slate-300"
                      >
                        {gName}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between shrink-0 bg-[#070b16]">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <ClipboardPaste className="w-3.5 h-3.5 text-indigo-400" />
            <span>เคล็ดลับ: สามารถกด Ctrl+V ที่หน้าเว็บเพื่อวางรูปภาพได้ตลอดเวลา</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};

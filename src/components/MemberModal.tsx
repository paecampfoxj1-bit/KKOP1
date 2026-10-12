import React, { useState, useEffect } from 'react';
import { X, UserPlus, UserCheck } from 'lucide-react';
import { GuildMember } from '../types';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberToEdit: GuildMember | null;
  onSave: (memberData: Omit<GuildMember, 'id' | 'updatedAt'> & { id?: string }) => void;
}

export const MemberModal: React.FC<MemberModalProps> = ({
  isOpen,
  onClose,
  memberToEdit,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<GuildMember['role']>('สมาชิก');
  const [checkedIn, setCheckedIn] = useState(false);
  const [hits, setHits] = useState(0);
  const [damage, setDamage] = useState<number | string>('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (memberToEdit) {
      setName(memberToEdit.name);
      setRole(memberToEdit.role);
      setCheckedIn(memberToEdit.checkedIn);
      setHits(memberToEdit.hits || 0);
      setDamage(memberToEdit.damage ?? '');
      setNote(memberToEdit.note || '');
    } else {
      setName('');
      setRole('สมาชิก');
      setCheckedIn(false);
      setHits(0);
      setDamage('');
      setNote('');
    }
  }, [memberToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: memberToEdit?.id,
      name: name.trim(),
      role,
      checkedIn,
      hits: Number(hits),
      maxHits: 3,
      damage: Number(damage) || 0,
      note: note.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            {memberToEdit ? (
              <>
                <UserCheck className="w-4 h-4 text-amber-400" />
                <span>แก้ไขข้อมูลสมาชิก</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 text-amber-400" />
                <span>เพิ่มสมาชิกใหม่ (กิลด์รอง)</span>
              </>
            )}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              ชื่อตัวละคร / ชื่อเล่น <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="เช่น นายเทพ, FoxHunter"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">ตำแหน่งในกิลด์</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as GuildMember['role'])}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-xs"
            >
              <option value="สมาชิก">สมาชิก</option>
              <option value="สมาชิกหลัก">สมาชิกหลัก</option>
              <option value="รองหัวหน้า">รองหัวหน้า</option>
              <option value="หัวหน้ากิลด์รอง">หัวหน้ากิลด์รอง</option>
              <option value="เด็กใหม่">เด็กใหม่</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">สถานะเช็คชื่อ</label>
              <select
                value={String(checkedIn)}
                onChange={e => setCheckedIn(e.target.value === 'true')}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-xs"
              >
                <option value="false">ยังไม่เช็คชื่อ</option>
                <option value="true">เช็คชื่อแล้ว</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">จำนวนรอบตี (0-3)</label>
              <select
                value={hits}
                onChange={e => {
                  const val = Number(e.target.value);
                  setHits(val);
                  if (val > 0) setCheckedIn(true);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-xs"
              >
                <option value={0}>0/3 (ยังไม่ตี)</option>
                <option value={1}>1/3 (ตี 1 รอบ)</option>
                <option value={2}>2/3 (ตี 2 รอบ)</option>
                <option value={3}>3/3 (ตีครบ 3 รอบ)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">ดาเมจรวมที่ทำได้ (ล้าน / M)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={damage}
              onChange={e => setDamage(e.target.value)}
              placeholder="เช่น 245.5"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">หมายเหตุ</label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="เช่น ตีรอบดึก, ลางานถึงวันศุกร์"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-xs"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-lg shadow-md transition-colors"
            >
              บันทึกข้อมูล
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export type RaidStatus = 'unbeaten' | 'beaten';
export type DropType = 'inventory' | 'guild' | 'other';
export type GuildIconType = 'dragon' | 'lion' | 'crows' | 'devil' | 'knight' | 'phoenix' | 'skull' | 'wolf';

export interface GuildRaidItem {
  id: string;
  name: string;
  level: number | null; // e.g. 12, null for 'ไม่ระบุเลเวล'
  status: RaidStatus; // 'unbeaten' = ยังไม่ได้ตี, 'beaten' = ตีแล้ว
  dropType: DropType; // 'inventory' = ของเข้าตัว, 'guild' = เข้ากิล, 'other' = อื่นๆ
  dropNote?: string; // e.g. 'คนอื่นตี'
  avatarIcon: GuildIconType;
  customImage?: string; // Base64 data URL from Ctrl+V or file upload
  note?: string;
  beatenAt?: number | null;
  updatedAt: number;
}

export interface WeeklyCycleInfo {
  cycleKey: string;
  cycleStartThai: Date;
  nextResetThai: Date;
  msRemaining: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  dateLabel: string;
}

export interface GuildMember {
  id: string;
  name: string;
  role: 'หัวหน้ากิลด์รอง' | 'รองหัวหน้า' | 'สมาชิกหลัก' | 'สมาชิก' | 'เด็กใหม่';
  checkedIn: boolean;
  hits: number;
  maxHits: number;
  damage: number;
  note: string;
  updatedAt: number;
}

export interface FirebaseConnectionConfig {
  apiKey: string;
  databaseURL: string;
  projectId: string;
  authDomain?: string;
  storageBucket?: string;
}

export interface AiDetectedGuild {
  guildId?: string;
  guildName: string;
  detectedStatus: 'beaten' | 'unbeaten' | 'unknown';
  hasInstantJoinButton?: boolean;
  instantJoinTextFound?: string;
  confidence?: 'high' | 'medium' | 'low';
  details: string;
}

export interface AiRaidCheckResult {
  summary: string;
  detectedGuilds: AiDetectedGuild[];
  guildsWithJoinButton?: string[];
  unbeatenRemaining?: string[];
  beatenGuilds?: string[];
  advice?: string;
}

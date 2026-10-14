import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));

// Data storage path
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'guild_data.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial demo guilds matching the screenshot
const INITIAL_DEMO_GUILDS = [
  {
    id: 'g1',
    name: 'SOLOLEVELING',
    level: 12,
    status: 'unbeaten',
    dropType: 'inventory',
    avatarIcon: 'dragon',
    updatedAt: Date.now(),
  },
  {
    id: 'g2',
    name: 'THAILAND',
    level: 12,
    status: 'unbeaten',
    dropType: 'inventory',
    avatarIcon: 'lion',
    updatedAt: Date.now(),
  },
  {
    id: 'g3',
    name: 'Crows',
    level: 10,
    status: 'beaten',
    dropType: 'inventory',
    avatarIcon: 'crows',
    beatenAt: Date.now() - 3600000,
    updatedAt: Date.now(),
  },
  {
    id: 'g4',
    name: 'DMTH',
    level: null,
    status: 'beaten',
    dropType: 'other',
    dropNote: 'คนอื่นตี',
    avatarIcon: 'devil',
    beatenAt: Date.now() - 7200000,
    updatedAt: Date.now(),
  },
];

// Calculate Wednesday 05:00 AM (Thai time UTC+7)
function getWednesdayCycleInfo(baseDate = new Date()) {
  const utc = baseDate.getTime() + baseDate.getTimezoneOffset() * 60000;
  const thaiNow = new Date(utc + 7 * 3600000);

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
  const cycleKey = `CYCLE_${y}_${m}_${d}_0500`;

  return { cycleKey, cycleStartThai, nextResetThai, msRemaining };
}

interface GuildDataStore {
  currentCycle: string;
  lastResetTime: number;
  guilds: any[];
}

function loadGuildData(): GuildDataStore {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (data && Array.isArray(data.guilds)) {
        return data;
      }
    }
  } catch (e) {
    console.error('Error reading guild data file:', e);
  }

  const cycleInfo = getWednesdayCycleInfo();
  const initialData: GuildDataStore = {
    currentCycle: cycleInfo.cycleKey,
    lastResetTime: Date.now(),
    guilds: INITIAL_DEMO_GUILDS,
  };
  saveGuildData(initialData);
  return initialData;
}

function saveGuildData(data: GuildDataStore) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving guild data file:', e);
  }
}

let store = loadGuildData();

// Server-Sent Events (SSE) connections list for real-time live broadcasting
let sseClients: Response[] = [];

function broadcastUpdate(payload: any) {
  const message = `data: ${JSON.stringify(payload)}\n\n`;
  sseClients.forEach(client => {
    try {
      client.write(message);
    } catch (e) {
      // client disconnected
    }
  });
}

// Server-side check for Wednesday 05:00 AM auto-reset
function checkWeeklyReset() {
  const cycle = getWednesdayCycleInfo();
  if (store.currentCycle !== cycle.cycleKey) {
    console.log(`[AutoReset] Wednesday 05:00 AM cycle transition: ${store.currentCycle} -> ${cycle.cycleKey}`);
    const resetGuilds = store.guilds.map((g: any) => ({
      ...g,
      status: 'unbeaten',
      beatenAt: null,
      updatedAt: Date.now(),
    }));

    store = {
      currentCycle: cycle.cycleKey,
      lastResetTime: Date.now(),
      guilds: resetGuilds,
    };
    saveGuildData(store);
    broadcastUpdate({ type: 'RESET', data: store, autoReset: true });
  }
}

// Check every 10 seconds
setInterval(checkWeeklyReset, 10000);

// API Endpoints
// 1. Get current guild data
app.get('/api/guilds', (_req: Request, res: Response) => {
  checkWeeklyReset();
  res.json({
    success: true,
    data: store,
  });
});

// 2. Update guilds (when anyone checks in, changes picture, edits status, adds/deletes guild)
app.post('/api/guilds', (req: Request, res: Response) => {
  const { guilds } = req.body;
  if (!Array.isArray(guilds)) {
    return res.status(400).json({ success: false, message: 'Invalid guilds array' });
  }

  store.guilds = guilds;
  store.lastResetTime = Date.now();
  saveGuildData(store);

  // Broadcast to all active users immediately!
  broadcastUpdate({ type: 'UPDATE', data: store });

  res.json({ success: true, data: store });
});

// 3. Manual Reset
app.post('/api/guilds/reset', (_req: Request, res: Response) => {
  const cycle = getWednesdayCycleInfo();
  const resetGuilds = store.guilds.map((g: any) => ({
    ...g,
    status: 'unbeaten',
    beatenAt: null,
    updatedAt: Date.now(),
  }));

  store = {
    currentCycle: cycle.cycleKey,
    lastResetTime: Date.now(),
    guilds: resetGuilds,
  };
  saveGuildData(store);

  broadcastUpdate({ type: 'RESET', data: store, manual: true });
  res.json({ success: true, data: store });
});

// 4. Reset to Initial Demo Data
app.post('/api/guilds/reset-demo', (_req: Request, res: Response) => {
  const cycle = getWednesdayCycleInfo();
  store = {
    currentCycle: cycle.cycleKey,
    lastResetTime: Date.now(),
    guilds: INITIAL_DEMO_GUILDS,
  };
  saveGuildData(store);
  broadcastUpdate({ type: 'UPDATE', data: store });
  res.json({ success: true, data: store });
});

// 5. AI Vision Raid Analysis: Check from image which guild has already raided/cleared
app.post('/api/ai/check-raid-image', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/png', userQuestion, guilds = [] } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, message: 'กรุณาส่งรูปภาพเพื่อทำการตรวจสอบ' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'ไม่พบ GEMINI_API_KEY บนเซิร์ฟเวอร์ กรุณาตรวจสอบการตั้งค่า',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
    const cleanMimeType = mimeType || 'image/png';

    const systemPrompt = `คุณคือ AI ผู้ช่วยตรวจสอบและวิเคราะห์ภาพการตีเรดกิลด์ (Guild Sub-Clan Raid Tracker) สำหรับเกมแนวผจญภัย/ตีบอสเรด
หน้าที่หลักของคุณ:
1. กวาดสายตาอ่านข้อความและปุ่มในรูปภาพอย่างละเอียดเป็นพิเศษ โดยเฉพาะคำว่า "เข้าร่วมทันที" (Instant Join) หรือคำใกล้เคียง เช่น "เข้าร่วม", "Join", "เข้าร่วมทันที!"
2. หาชื่อกิลด์ทั้งหมดที่มีปุ่มหรือคำว่า "เข้าร่วมทันที" อยู่ข้างๆ หรือในแถบข้อมูลของกิลด์นั้น
3. เข้าใจกฎของระบบเรดในเกมนี้:
   - กิลด์ที่มีปุ่มหรือคำว่า "เข้าร่วมทันที" คือ **"กิลด์ที่ยังไม่ได้ลงเรด / ยังเปิดให้เข้าตีได้ / ยังไม่เสร็จสิ้น"** (detectedStatus = 'unbeaten', hasInstantJoinButton = true)
   - กิลด์ที่ไม่มีปุ่มเข้าร่วมทันที หรือมีสถานะ "สำเร็จแล้ว", "เคลียร์แล้ว", "จบแล้ว", "ได้รับรางวัลแล้ว", หรือมีคะแนนเต็มแล้ว คือ **"กิลด์ที่ลงไปแล้ว"** (detectedStatus = 'beaten', hasInstantJoinButton = false)
4. สรุปอย่างชัดเจนและแม่นยำ:
   - กิลด์ใดบ้างที่มีคำว่า "เข้าร่วมทันที"
   - กิลด์ใดบ้างที่ยังไม่ได้ลง (Unbeaten)
   - กิลด์ใดบ้างที่ลงไปแล้ว (Beaten)
5. สรุปผลเป็นภาษาไทยที่กระชับ เป็นกันเอง อ่านเข้าใจง่ายทันที

รายชื่อกิลด์ทั้งหมดในระบบปัจจุบัน:
${JSON.stringify(guilds, null, 2)}

คำถามหรือข้อสงสัยของผู้ใช้: "${userQuestion || 'จากรูปให้หาชื่อกิลด์ที่มีคำว่าเข้าร่วมทันที และดูว่ากิลด์ไหนยังไม่ได้ลง'}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: cleanMimeType,
              data: cleanBase64,
            },
          },
          {
            text: `ช่วยตรวจจากรูปนี้อย่างละเอียด: ${userQuestion || 'จากรูปให้หาชื่อกิลด์ที่มีคำว่าเข้าร่วมทันที และดูว่ากิลด์ไหนยังไม่ได้ลง'}`,
          },
        ],
      },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: 'คำสรุปผลภาษาไทยชัดเจน ระบุชื่อกิลด์ที่มีคำว่า "เข้าร่วมทันที" และกิลด์ที่ยังไม่ได้ลง',
            },
            guildsWithJoinButton: {
              type: Type.ARRAY,
              description: 'รายชื่อกิลด์ทั้งหมดในรูปภาพที่มีคำว่า "เข้าร่วมทันที"',
              items: { type: Type.STRING },
            },
            detectedGuilds: {
              type: Type.ARRAY,
              description: 'รายการกิลด์ที่ตรวจพบในรูป',
              items: {
                type: Type.OBJECT,
                properties: {
                  guildId: { type: Type.STRING, description: 'ID ของกิลด์ที่ตรงกับในระบบ (ถ้ามี)' },
                  guildName: { type: Type.STRING, description: 'ชื่อกิลด์' },
                  hasInstantJoinButton: {
                    type: Type.BOOLEAN,
                    description: 'เป็นจริงถ้าในรูปมีคำว่า "เข้าร่วมทันที" ปรากฏอยู่กับกิลด์นี้',
                  },
                  instantJoinTextFound: {
                    type: Type.STRING,
                    description: 'ข้อความปุ่มที่พบ เช่น "เข้าร่วมทันที"',
                  },
                  detectedStatus: {
                    type: Type.STRING,
                    description: 'สถานะที่พบ: "beaten" (ลงไปแล้ว/ตีแล้ว), "unbeaten" (ยังไม่ได้ลง), หรือ "unknown"',
                  },
                  confidence: { type: Type.STRING, description: 'ระดับความมั่นใจ: "high", "medium", "low"' },
                  details: { type: Type.STRING, description: 'ข้อความหรือหลักฐานที่พบในภาพ เช่น มีปุ่มเข้าร่วมทันที, แถบสถานะ, ตัวเลขดาเมจ' },
                },
                required: ['guildName', 'detectedStatus', 'details'],
              },
            },
            unbeatenRemaining: {
              type: Type.ARRAY,
              description: 'รายชื่อกิลด์ที่ยังไม่ได้ลงเรด (กิลด์ที่มีปุ่มเข้าร่วมทันที หรือยังไม่เสร็จ)',
              items: { type: Type.STRING },
            },
            beatenGuilds: {
              type: Type.ARRAY,
              description: 'รายชื่อกิลด์ที่ลงไปแล้ว (ไม่มีปุ่มเข้าร่วมทันที / เคลียร์แล้ว)',
              items: { type: Type.STRING },
            },
            advice: {
              type: Type.STRING,
              description: 'คำแนะนำเพิ่มเติมสำหรับหัวหน้ากิลด์หรือสมาชิก',
            },
          },
          required: ['summary', 'detectedGuilds'],
        },
      },
    });

    const responseText = response.text || '{}';
    let parsedResult;
    try {
      parsedResult = JSON.parse(responseText);
    } catch {
      parsedResult = { summary: responseText, detectedGuilds: [] };
    }

    res.json({
      success: true,
      data: parsedResult,
    });
  } catch (error: any) {
    console.error('Gemini vision raid check error:', error);
    res.status(500).json({
      success: false,
      message: error?.message || 'เกิดข้อผิดพลาดในการวิเคราะห์รูปภาพด้วย AI',
    });
  }
});

// 5.1 AI Vision Guild Card Extractor: Extract 1. Emblem box, 2. Name, 3. Level
app.post('/api/ai/parse-guild-card', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/png' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, message: 'กรุณาส่งรูปภาพเพื่อทำการดึงข้อมูล' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'ไม่พบ GEMINI_API_KEY บนเซิร์ฟเวอร์',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
    const cleanMimeType = mimeType || 'image/png';

    const systemPrompt = `คุณคือ AI ผู้เชี่ยวชาญการอ่านและวิเคราะห์ภาพหน้าจอข้อมูลกิลด์/แคลนในเกม (Clan Information / Guild Card)
ภาพที่ผู้ใช้ส่งมาคือหน้าจอเกมในเมนู "แคลน" -> "ข้อมูลแคลน" (หน้าที่มีตราสัญลักษณ์กิลด์, ชื่อกิลด์, และเลเวลแคลน)

หน้าที่สำคัญของคุณคืออ่านภาพและดึงข้อมูล 3 อย่างต่อไปนี้อย่างแม่นยำที่สุด:
1. รูปตราสัญลักษณ์หรือโลโก้กิลด์ (Guild Emblem):
   - ระบุกรอบพิกัดสี่เหลี่ยม [ymin, xmin, ymax, xmax] ของตราสัญลักษณ์กิลด์ (เช่น รูปกรงเล็บ, รูปดาวแปดแฉก/เพชร, มังกร, สัตว์เทพ หรือสัญลักษณ์ที่อยู่เหนือชื่อกิลด์) ในสเกล 0-1000
   - กรอบพิกัดต้องครอบคลุมตัวตราสัญลักษณ์กิลด์ให้พอดี (ไม่รวมชื่อกิลด์ด้านล่าง)
2. ชื่อกิลด์ (Guild Name):
   - ข้อความชื่อกิลด์/แคลนที่อยู่ใต้ตราสัญลักษณ์ (เช่น "Love111", "vietnamclan", "KhaiTitan") อ่านตัวอักษรพิมพ์เล็ก-พิมพ์ใหญ่ให้ตรงตามจริง
3. เลเวลกิลด์ (Guild Level):
   - ตัวเลขอันดับเลเวลของกิลด์/แคลน เช่น ในส่วน "เลเวลแคลน เลเวล 18" ให้ดึงเฉพาะตัวเลขจำนวนเต็ม 18 หรือหากเป็น "เลเวล 9" ให้ดึง 9

ส่งคืน JSON ตาม Schema ที่กำหนด`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: cleanMimeType,
              data: cleanBase64,
            },
          },
          {
            text: 'ช่วยอ่านภาพหน้าจอข้อมูลแคลนนี้ แล้วดึง 1. พิกัดรูปตรากิลด์ [ymin, xmin, ymax, xmax], 2. ชื่อกิลด์, 3. เลเวลกิลด์',
          },
        ],
      },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            guildName: {
              type: Type.STRING,
              description: 'ชื่อกิลด์ที่พบ เช่น "Love111" หรือ "vietnamclan"',
            },
            guildLevel: {
              type: Type.INTEGER,
              description: 'เลเวลของกิลด์/แคลน (ตัวเลขจำนวนเต็ม เช่น 18 หรือ 9)',
            },
            emblemBox: {
              type: Type.ARRAY,
              description: 'พิกัดกรอบรูปตราสัญลักษณ์กิลด์ [ymin, xmin, ymax, xmax] ในสเกล 0-1000',
              items: { type: Type.INTEGER },
            },
            confidence: {
              type: Type.STRING,
              description: 'ความมั่นใจ: "high", "medium", "low"',
            },
            rawDetails: {
              type: Type.STRING,
              description: 'รายละเอียดข้อความที่ตรวจพบในหน้าจอ',
            },
          },
          required: ['guildName', 'guildLevel', 'emblemBox'],
        },
      },
    });

    const responseText = response.text || '{}';
    let parsedResult;
    try {
      parsedResult = JSON.parse(responseText);
    } catch {
      parsedResult = { guildName: '', guildLevel: null, emblemBox: [100, 200, 450, 500] };
    }

    res.json({
      success: true,
      data: parsedResult,
    });
  } catch (error: any) {
    console.error('Gemini guild card parse error:', error);
    res.status(500).json({
      success: false,
      message: error?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลจากรูปภาพ',
    });
  }
});

// 6. Real-time Live Sync Stream via Server-Sent Events (SSE)
app.get('/api/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send current state upon connecting
  res.write(`data: ${JSON.stringify({ type: 'INIT', data: store })}\n\n`);

  sseClients.push(res);

  // Heartbeat ping every 15s to keep connection healthy
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 15000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients = sseClients.filter(c => c !== res);
  });
});

// Mount Vite or Static Files
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 KKop Guild Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

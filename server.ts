import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

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

// 5. Real-time Live Sync Stream via Server-Sent Events (SSE)
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

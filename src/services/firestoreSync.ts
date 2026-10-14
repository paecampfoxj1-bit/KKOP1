import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
  query,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, testConnection } from '../firebase';
import { GuildRaidItem } from '../types';

const GUILDS_COLLECTION = 'guilds';
const SYSTEM_COLLECTION = 'system';
const SYSTEM_STATE_DOC = 'current';

/**
 * Sanitizes a guild object for Firestore to guarantee no field has an `undefined` value,
 * which Firestore strictly forbids and throws WriteBatch.set() errors on.
 */
export function sanitizeGuildForFirestore(guild: any): Record<string, any> {
  const sanitized: Record<string, any> = {
    id: String(guild.id || ''),
    name: String(guild.name || ''),
    level: guild.level !== undefined && guild.level !== null && guild.level !== '' ? Number(guild.level) : null,
    status: guild.status === 'beaten' ? 'beaten' : 'unbeaten',
    dropType: guild.dropType || 'inventory',
    dropNote: guild.dropNote !== undefined && guild.dropNote !== null ? String(guild.dropNote) : null,
    avatarIcon: guild.avatarIcon || 'dragon',
    customImage: guild.customImage !== undefined && guild.customImage !== null ? String(guild.customImage) : null,
    note: guild.note !== undefined && guild.note !== null ? String(guild.note) : null,
    beatenAt: typeof guild.beatenAt === 'number' ? guild.beatenAt : null,
    updatedAt: typeof guild.updatedAt === 'number' ? guild.updatedAt : Date.now(),
  };

  // Extra safety: iterate through keys and ensure NO value is undefined
  for (const key of Object.keys(sanitized)) {
    if (sanitized[key] === undefined) {
      sanitized[key] = null;
    }
  }

  return sanitized;
}

/**
 * Initializes test connection and returns unsubscribe for live sync
 */
export function subscribeToFirestore(
  onGuildsUpdate: (guilds: GuildRaidItem[]) => void,
  onCycleUpdate: (cycleKey: string) => void,
  onStatusChange: (connected: boolean) => void,
  initialDefaultGuilds: GuildRaidItem[]
) {
  testConnection();

  const guildsQuery = query(collection(db, GUILDS_COLLECTION));
  let isInitialLoaded = false;

  const unsubscribeGuilds = onSnapshot(
    guildsQuery,
    async (snapshot) => {
      onStatusChange(true);
      if (snapshot.empty && !isInitialLoaded) {
        isInitialLoaded = true;
        // First time initialization: seed default guilds into Firestore
        try {
          const batch = writeBatch(db);
          for (const guild of initialDefaultGuilds) {
            const guildRef = doc(db, GUILDS_COLLECTION, guild.id);
            batch.set(guildRef, sanitizeGuildForFirestore(guild));
          }
          await batch.commit();
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, GUILDS_COLLECTION);
        }
        return;
      }

      isInitialLoaded = true;
      const items: GuildRaidItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as GuildRaidItem;
        items.push({
          ...data,
          id: docSnap.id,
        });
      });

      // Sort by updatedAt or retain order
      if (items.length > 0) {
        onGuildsUpdate(items);
      }
    },
    (error) => {
      onStatusChange(false);
      handleFirestoreError(error, OperationType.LIST, GUILDS_COLLECTION);
    }
  );

  // Subscribe to system state for weekly reset sync
  const systemDocRef = doc(db, SYSTEM_COLLECTION, SYSTEM_STATE_DOC);
  const unsubscribeSystem = onSnapshot(
    systemDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data?.currentCycle) {
          onCycleUpdate(data.currentCycle);
        }
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `${SYSTEM_COLLECTION}/${SYSTEM_STATE_DOC}`);
    }
  );

  return () => {
    unsubscribeGuilds();
    unsubscribeSystem();
  };
}

/**
 * Save or update a single guild item in Firestore in real time
 */
export async function syncGuildToFirestore(guild: GuildRaidItem): Promise<void> {
  const guildRef = doc(db, GUILDS_COLLECTION, guild.id);
  try {
    await setDoc(guildRef, sanitizeGuildForFirestore(guild), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${GUILDS_COLLECTION}/${guild.id}`);
  }
}

/**
 * Save entire guild list to Firestore
 */
export async function syncAllGuildsToFirestore(guilds: GuildRaidItem[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    for (const g of guilds) {
      const ref = doc(db, GUILDS_COLLECTION, g.id);
      batch.set(ref, sanitizeGuildForFirestore(g), { merge: true });
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, GUILDS_COLLECTION);
  }
}

/**
 * Delete a guild from Firestore
 */
export async function deleteGuildFromFirestore(guildId: string): Promise<void> {
  const guildRef = doc(db, GUILDS_COLLECTION, guildId);
  try {
    await deleteDoc(guildRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${GUILDS_COLLECTION}/${guildId}`);
  }
}

/**
 * Sync cycle key (Wednesday reset) to Firestore
 */
export async function syncCycleKeyToFirestore(cycleKey: string, resetGuilds?: GuildRaidItem[]): Promise<void> {
  const systemRef = doc(db, SYSTEM_COLLECTION, SYSTEM_STATE_DOC);
  try {
    const batch = writeBatch(db);
    batch.set(
      systemRef,
      {
        currentCycle: cycleKey,
        lastResetAt: Date.now(),
        updatedAt: Date.now(),
      },
      { merge: true }
    );

    if (resetGuilds && resetGuilds.length > 0) {
      for (const g of resetGuilds) {
        const ref = doc(db, GUILDS_COLLECTION, g.id);
        batch.set(ref, sanitizeGuildForFirestore(g), { merge: true });
      }
    }

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${SYSTEM_COLLECTION}/${SYSTEM_STATE_DOC}`);
  }
}

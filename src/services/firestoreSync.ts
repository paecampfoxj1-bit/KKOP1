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
            batch.set(guildRef, guild);
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
    await setDoc(guildRef, guild, { merge: true });
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
      batch.set(ref, g, { merge: true });
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
        batch.set(ref, g, { merge: true });
      }
    }

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${SYSTEM_COLLECTION}/${SYSTEM_STATE_DOC}`);
  }
}

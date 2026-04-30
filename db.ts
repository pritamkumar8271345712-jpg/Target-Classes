import {
  collection,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  type Unsubscribe,
  enableIndexedDbPersistence,
  type DocumentData,
} from 'firebase/firestore';
import { db } from './config';

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err: { code: string }) => {
  if (err.code === 'failed-precondition') {
    console.warn('Firestore persistence: multiple tabs open');
  } else if (err.code === 'unimplemented') {
    console.warn('Firestore persistence: not supported');
  }
});

// Helper to build collection path
const col = (uid: string, name: string) => collection(db, 'users', uid, name);

// Generic subscribe
function subscribe<T>(
  uid: string,
  collectionName: string,
  onData: (data: T[]) => void,
  onError: (err: string) => void
): Unsubscribe {
  const q = query(col(uid, collectionName));
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as object) } as T));
      onData(items);
    },
    (err) => {
      console.error(`[Firestore] ${collectionName} error:`, err.message);
      onError(err.message);
    }
  );
}

// Generic create
async function create<T extends DocumentData>(uid: string, collectionName: string, data: T): Promise<string> {
  const ref = await addDoc(col(uid, collectionName), data);
  console.log(`[Firestore] Created in ${collectionName}:`, ref.id);
  return ref.id;
}

// Generic update - uses setDoc with merge for reliability
async function update<T extends DocumentData>(uid: string, collectionName: string, id: string, data: T): Promise<void> {
  await setDoc(doc(db, 'users', uid, collectionName, id), data, { merge: true });
  console.log(`[Firestore] Updated in ${collectionName}:`, id);
}

// Generic remove
async function remove(uid: string, collectionName: string, id: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, collectionName, id));
  console.log(`[Firestore] Deleted from ${collectionName}:`, id);
}

// ========== EXPORTS ==========

export const dbStudents = {
  subscribe: <T>(uid: string, onData: (d: T[]) => void, onError: (e: string) => void) => subscribe<T>(uid, 'students', onData, onError),
  create: <T extends DocumentData>(uid: string, data: T) => create<T>(uid, 'students', data),
  update: <T extends DocumentData>(uid: string, id: string, data: T) => update<T>(uid, 'students', id, data),
  remove: (uid: string, id: string) => remove(uid, 'students', id),
};

export const dbTeachers = {
  subscribe: <T>(uid: string, onData: (d: T[]) => void, onError: (e: string) => void) => subscribe<T>(uid, 'teachers', onData, onError),
  create: <T extends DocumentData>(uid: string, data: T) => create<T>(uid, 'teachers', data),
  update: <T extends DocumentData>(uid: string, id: string, data: T) => update<T>(uid, 'teachers', id, data),
  remove: (uid: string, id: string) => remove(uid, 'teachers', id),
};

export const dbDueEntries = {
  subscribe: <T>(uid: string, onData: (d: T[]) => void, onError: (e: string) => void) => subscribe<T>(uid, 'dueEntries', onData, onError),
  create: <T extends DocumentData>(uid: string, data: T) => create<T>(uid, 'dueEntries', data),
  update: <T extends DocumentData>(uid: string, id: string, data: T) => update<T>(uid, 'dueEntries', id, data),
  remove: (uid: string, id: string) => remove(uid, 'dueEntries', id),
};

export const dbPaidEntries = {
  subscribe: <T>(uid: string, onData: (d: T[]) => void, onError: (e: string) => void) => subscribe<T>(uid, 'paidEntries', onData, onError),
  create: <T extends DocumentData>(uid: string, data: T) => create<T>(uid, 'paidEntries', data),
  update: <T extends DocumentData>(uid: string, id: string, data: T) => update<T>(uid, 'paidEntries', id, data),
  remove: (uid: string, id: string) => remove(uid, 'paidEntries', id),
};

export const dbExpenses = {
  subscribe: <T>(uid: string, onData: (d: T[]) => void, onError: (e: string) => void) => subscribe<T>(uid, 'expenses', onData, onError),
  create: <T extends DocumentData>(uid: string, data: T) => create<T>(uid, 'expenses', data),
  update: <T extends DocumentData>(uid: string, id: string, data: T) => update<T>(uid, 'expenses', id, data),
  remove: (uid: string, id: string) => remove(uid, 'expenses', id),
};

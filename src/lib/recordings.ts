// Rekaman suara guru disimpan di IndexedDB browser (blob audio terlalu besar untuk localStorage).
// Kunci: `${karakter}/${slug}`, mis. "aisyah/rukuk". Nanti bisa diunggah ke Supabase Storage.
const DB = 'sholat-ceria-audio', STORE = 'rec';

function open(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  const db = await open();
  return new Promise((res, rej) => {
    const req = fn(db.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => res(req.result as T);
    req.onerror = () => rej(req.error);
  });
}

export const getRecording = (key: string) => tx<Blob | undefined>('readonly', (s) => s.get(key)).catch(() => undefined);
export const saveRecording = (key: string, blob: Blob) => tx('readwrite', (s) => s.put(blob, key));
export const deleteRecording = (key: string) => tx('readwrite', (s) => s.delete(key));

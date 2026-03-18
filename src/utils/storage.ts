import { db } from '../firebase';
import { doc, setDoc, updateDoc, deleteDoc, collection, onSnapshot } from 'firebase/firestore';
import { Task, Settings } from '../types';

const defaultSettings: Settings = {
  userA: { name: 'Aさん' },
  userB: { name: 'Bさん' },
  ntfyTopic: '',
  appIcon: '✅',
};

function stripUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

export { defaultSettings };

export async function saveSettings(settings: Settings): Promise<void> {
  await setDoc(doc(db, 'yarukoto', 'settings'), settings);
}

export async function saveTask(task: Task): Promise<void> {
  await setDoc(doc(db, 'tasks', task.id), stripUndefined(task));
}

export async function updateTask(id: string, data: Partial<Task>): Promise<void> {
  await updateDoc(doc(db, 'tasks', id), stripUndefined(data));
}

export async function deleteTask(id: string): Promise<void> {
  await deleteDoc(doc(db, 'tasks', id));
}

export function subscribeSettings(
  callback: (s: Settings) => void,
  onError?: () => void
): () => void {
  return onSnapshot(
    doc(db, 'yarukoto', 'settings'),
    snap => callback(snap.exists() ? { ...defaultSettings, ...(snap.data() as Settings) } : { ...defaultSettings }),
    () => onError?.()
  );
}

export function subscribeTasks(
  callback: (tasks: Task[]) => void,
  onError?: () => void
): () => void {
  return onSnapshot(
    collection(db, 'tasks'),
    snap => callback(snap.docs.map(d => d.data() as Task)),
    () => onError?.()
  );
}

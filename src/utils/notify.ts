import { Settings, Task, User } from '../types';

async function push(topic: string, title: string, body: string): Promise<void> {
  if (!topic.trim()) return;
  await fetch('https://ntfy.sh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic: topic.trim(), title, message: body, priority: 3, tags: ['bell'] }),
  });
}

export async function notifyAssigned(task: Task, settings: Settings, assignedTo: User): Promise<void> {
  const assigner = assignedTo === 'A' ? settings.userB : settings.userA;
  await push(settings.ntfyTopic, `📋 タスク割り当て：${task.title}`, `${assigner.name}から「${task.title}」が割り当てられました`).catch(() => {});
}

export async function notifyCompleted(task: Task, settings: Settings, completedBy: User): Promise<void> {
  const completer = completedBy === 'A' ? settings.userA : settings.userB;
  await push(settings.ntfyTopic, `✅ タスク完了：${task.title}`, `${completer.name}が「${task.title}」を完了しました`).catch(() => {});
}

export async function notifyDueReminder(task: Task, settings: Settings): Promise<void> {
  await push(settings.ntfyTopic, `⏰ 期限リマインダー：${task.title}`, `「${task.title}」の期限が近づいています`).catch(() => {});
}

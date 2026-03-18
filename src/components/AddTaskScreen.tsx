import { useState } from 'react';
import { Task, User, Settings, Priority, Subtask } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { getPoints } from '../utils/points';

type Props = {
  currentUser: User;
  settings: Settings;
  editTask?: Task;
  onSubmit: (task: Task) => void;
  onCancel: () => void;
};

export default function AddTaskScreen({ currentUser, settings, editTask, onSubmit, onCancel }: Props) {
  const otherUser: User = currentUser === 'A' ? 'B' : 'A';

  const [title, setTitle] = useState(editTask?.title ?? '');
  const [description, setDescription] = useState(editTask?.description ?? '');
  const [assignee, setAssignee] = useState<User | 'both'>(editTask?.assignee ?? currentUser);
  const [priority, setPriority] = useState<Priority>(editTask?.priority ?? 'medium');
  const [category, setCategory] = useState(editTask?.category ?? '');
  const [dueDate, setDueDate] = useState(editTask?.dueDate ?? '');
  const [recurringType, setRecurringType] = useState<'none' | 'daily' | 'weekly' | 'monthly'>(
    editTask?.recurring?.type ?? 'none'
  );
  const [subtasks, setSubtasks] = useState<Subtask[]>(editTask?.subtasks ?? []);
  const [newSubtask, setNewSubtask] = useState('');

  const selfName = currentUser === 'A' ? settings.userA.name : settings.userB.name;
  const otherName = otherUser === 'A' ? settings.userA.name : settings.userB.name;

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    setSubtasks(prev => [...prev, { id: uuidv4(), title: newSubtask.trim(), done: false }]);
    setNewSubtask('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const now = new Date().toISOString();
    const task: Task = {
      id: editTask?.id ?? uuidv4(),
      title: title.trim(),
      assignee,
      createdBy: editTask?.createdBy ?? currentUser,
      priority,
      category: category.trim(),
      status: editTask?.status ?? 'todo',
      pinned: editTask?.pinned ?? false,
      points: getPoints(priority),
      createdAt: editTask?.createdAt ?? now,
      subtasks,
      comments: editTask?.comments ?? [],
      ...(description.trim() && { description: description.trim() }),
      ...(dueDate && { dueDate }),
      ...(recurringType !== 'none' && { recurring: { type: recurringType, nextDue: dueDate || now.slice(0, 10) } }),
      ...(editTask?.completedBy && { completedBy: editTask.completedBy }),
      ...(editTask?.completedAt && { completedAt: editTask.completedAt }),
    };
    onSubmit(task);
  };

  const priorities: { value: Priority; label: string; color: string }[] = [
    { value: 'low', label: '低', color: 'bg-gray-100 text-gray-600' },
    { value: 'medium', label: '中', color: 'bg-blue-100 text-blue-700' },
    { value: 'high', label: '高', color: 'bg-orange-100 text-orange-700' },
    { value: 'urgent', label: '緊急', color: 'bg-red-100 text-red-700' },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">{editTask ? '✏️ タスク編集' : '➕ タスク追加'}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">タイトル <span className="text-red-500">*</span></label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="input-field" placeholder="タスク名を入力" required />
        </div>

        <div>
          <label className="label">説明（任意）</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="input-field resize-none" placeholder="詳細を入力..." />
        </div>

        <div>
          <label className="label">担当者</label>
          <div className="flex gap-2">
            {([
              { value: currentUser, label: selfName },
              { value: otherUser, label: otherName },
              { value: 'both', label: '2人' },
            ] as { value: User | 'both'; label: string }[]).map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setAssignee(opt.value)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-colors min-h-[44px] ${assignee === opt.value ? 'border-primary-400 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">優先度</label>
          <div className="flex gap-2">
            {priorities.map(p => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPriority(p.value)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-colors min-h-[44px] ${priority === p.value ? `${p.color} border-current` : 'border-gray-200 text-gray-400'}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">カテゴリ（任意）</label>
          <input type="text" value={category} onChange={e => setCategory(e.target.value)} className="input-field" placeholder="例: 家事・買い物・仕事" />
        </div>

        <div>
          <label className="label">期限日（任意）</label>
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="input-field" />
        </div>

        <div>
          <label className="label">繰り返し</label>
          <select value={recurringType} onChange={e => setRecurringType(e.target.value as typeof recurringType)} className="input-field">
            <option value="none">なし</option>
            <option value="daily">毎日</option>
            <option value="weekly">毎週</option>
            <option value="monthly">毎月</option>
          </select>
        </div>

        <div>
          <label className="label">サブタスク</label>
          {subtasks.map((st, i) => (
            <div key={st.id} className="flex items-center gap-2 mb-2">
              <span className="text-gray-400 text-sm flex-1">{st.title}</span>
              <button type="button" onClick={() => setSubtasks(prev => prev.filter((_, j) => j !== i))} className="text-red-400 text-sm p-1">✕</button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              type="text"
              value={newSubtask}
              onChange={e => setNewSubtask(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSubtask(); } }}
              className="input-field flex-1"
              placeholder="サブタスクを追加..."
            />
            <button type="button" onClick={addSubtask} disabled={!newSubtask.trim()} className="btn-primary px-4 py-2 rounded-xl text-sm">追加</button>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onCancel} className="flex-1 btn-secondary">キャンセル</button>
          <button type="submit" disabled={!title.trim()} className="flex-1 btn-primary">{editTask ? '保存する' : '追加する'}</button>
        </div>
      </form>
    </div>
  );
}

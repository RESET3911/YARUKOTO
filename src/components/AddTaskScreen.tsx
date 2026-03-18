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

  const priorities: { value: Priority; label: string; activeColor: string }[] = [
    { value: 'low',    label: '低',   activeColor: 'bg-white/10 text-white/60 border-white/20' },
    { value: 'medium', label: '中',   activeColor: 'bg-blue-500/15 text-blue-400 border-blue-400/40' },
    { value: 'high',   label: '高',   activeColor: 'bg-orange-500/15 text-orange-400 border-orange-400/40' },
    { value: 'urgent', label: '緊急', activeColor: 'bg-rose-500/15 text-rose-400 border-rose-400/40' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0f' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-white/[0.06]" style={{ backgroundColor: '#0a0a0f' }}>
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onCancel} className="text-white/40 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-xl">←</button>
          <h2 className="font-bold text-white">{editTask ? 'タスクを編集' : '新しいタスク'}</h2>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Title */}
          <div>
            <label className="label">タイトル</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="input-field text-lg font-semibold"
              placeholder="何をする？"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="label">メモ（任意）</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              className="input-field resize-none"
              placeholder="詳細を入力..."
            />
          </div>

          {/* Assignee */}
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
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all min-h-[44px] ${
                    assignee === opt.value
                      ? 'bg-primary-500/15 border-primary-400/50 text-primary-300'
                      : 'border-white/10 text-white/30 active:text-white/60'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="label">優先度</label>
            <div className="flex gap-2">
              {priorities.map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all min-h-[44px] ${
                    priority === p.value ? p.activeColor : 'border-white/10 text-white/30'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="label">カテゴリ（任意）</label>
            <input
              type="text"
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="input-field"
              placeholder="家事・買い物・仕事..."
            />
          </div>

          {/* Due date */}
          <div>
            <label className="label">期限日（任意）</label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Recurring */}
          <div>
            <label className="label">繰り返し</label>
            <select
              value={recurringType}
              onChange={e => setRecurringType(e.target.value as typeof recurringType)}
              className="input-field"
            >
              <option value="none">なし</option>
              <option value="daily">毎日</option>
              <option value="weekly">毎週</option>
              <option value="monthly">毎月</option>
            </select>
          </div>

          {/* Subtasks */}
          <div>
            <label className="label">サブタスク</label>
            {subtasks.length > 0 && (
              <div className="mb-2 space-y-1.5">
                {subtasks.map((st, i) => (
                  <div key={st.id} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/[0.06]" style={{ backgroundColor: '#1a1a2a' }}>
                    <span className="flex-1 text-sm text-white/60">{st.title}</span>
                    <button
                      type="button"
                      onClick={() => setSubtasks(prev => prev.filter((_, j) => j !== i))}
                      className="text-white/25 text-sm p-1 active:text-rose-400"
                    >✕</button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtask}
                onChange={e => setNewSubtask(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSubtask(); } }}
                className="input-field flex-1"
                placeholder="サブタスクを追加..."
              />
              <button
                type="button"
                onClick={addSubtask}
                disabled={!newSubtask.trim()}
                className="btn-secondary px-4 py-2 rounded-xl text-sm"
              >追加</button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 pb-8">
            <button type="button" onClick={onCancel} className="flex-1 btn-secondary">キャンセル</button>
            <button type="submit" disabled={!title.trim()} className="flex-1 btn-primary">
              {editTask ? '保存する' : '追加する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

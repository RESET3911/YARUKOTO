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

  const priorities: { value: Priority; label: string; active: string }[] = [
    { value: 'low',    label: '低',   active: 'bg-gray-100 text-gray-600 border-gray-300' },
    { value: 'medium', label: '中',   active: 'bg-primary-50 text-primary-600 border-primary-300' },
    { value: 'high',   label: '高',   active: 'bg-orange-50 text-orange-600 border-orange-300' },
    { value: 'urgent', label: '緊急', active: 'bg-red-50 text-red-600 border-red-300' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onCancel} className="text-gray-400 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-lg">←</button>
          <h2 className="font-black text-gray-900">{editTask ? 'タスクを編集' : '新しいタスク'}</h2>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Title */}
          <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full text-xl font-black text-gray-900 placeholder:text-gray-200 bg-transparent border-none outline-none min-h-[44px]"
              placeholder="何をする？"
              required
            />
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              className="w-full text-sm text-gray-500 placeholder:text-gray-300 bg-transparent border-none outline-none resize-none mt-2"
              placeholder="詳細メモ（任意）..."
            />
          </div>

          {/* Assignee */}
          <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
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
                  className={`flex-1 py-2.5 rounded-2xl text-sm font-bold border-2 transition-all min-h-[44px] ${
                    assignee === opt.value
                      ? 'bg-primary-50 border-primary-400 text-primary-600'
                      : 'border-gray-100 text-gray-400 active:border-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
            <label className="label">優先度</label>
            <div className="flex gap-2">
              {priorities.map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={`flex-1 py-2.5 rounded-2xl text-sm font-bold border-2 transition-all min-h-[44px] ${
                    priority === p.value ? p.active : 'border-gray-100 text-gray-400'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-4">
            <div>
              <label className="label">カテゴリ（任意）</label>
              <input type="text" value={category} onChange={e => setCategory(e.target.value)} className="input-field" placeholder="家事・買い物・仕事..." />
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
          </div>

          {/* Subtasks */}
          <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
            <label className="label">サブタスク</label>
            {subtasks.length > 0 && (
              <div className="mb-3 space-y-1.5">
                {subtasks.map((st, i) => (
                  <div key={st.id} className="flex items-center gap-2 bg-gray-50 rounded-2xl px-3 py-2">
                    <span className="flex-1 text-sm text-gray-600">{st.title}</span>
                    <button type="button" onClick={() => setSubtasks(prev => prev.filter((_, j) => j !== i))} className="text-gray-300 p-1 active:text-red-400">✕</button>
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
              <button type="button" onClick={addSubtask} disabled={!newSubtask.trim()} className="btn-secondary px-4 py-2 rounded-2xl text-sm">追加</button>
            </div>
          </div>

          <div className="flex gap-3 pb-8">
            <button type="button" onClick={onCancel} className="flex-1 btn-secondary">キャンセル</button>
            <button type="submit" disabled={!title.trim()} className="flex-1 btn-primary">{editTask ? '保存する' : '追加する'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

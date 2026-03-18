import { useState } from 'react';
import { Task, User, Settings } from '../types';
import TaskCard from './TaskCard';

type Filter = 'mine' | 'theirs' | 'all';

type Props = {
  currentUser: User;
  settings: Settings;
  tasks: Task[];
  onToggleDone: (task: Task) => void;
  onPin: (task: Task) => void;
  onOpen: (task: Task) => void;
  onAdd: () => void;
};

const PRIORITY_ORDER = { urgent: 0, high: 1, medium: 2, low: 3 };

export default function TaskListScreen({ currentUser, settings, tasks, onToggleDone, onPin, onOpen, onAdd }: Props) {
  const [filter, setFilter] = useState<Filter>('mine');
  const [showDone, setShowDone] = useState(false);

  const otherUser: User = currentUser === 'A' ? 'B' : 'A';
  const selfName = currentUser === 'A' ? settings.userA.name : settings.userB.name;
  const otherName = otherUser === 'A' ? settings.userA.name : settings.userB.name;

  const filtered = tasks
    .filter(t => {
      if (!showDone && t.status === 'done') return false;
      if (filter === 'mine') return t.assignee === currentUser || t.assignee === 'both';
      if (filter === 'theirs') return t.assignee === otherUser || t.assignee === 'both';
      return true;
    })
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      if (a.status !== b.status) return a.status === 'todo' ? -1 : 1;
      const pDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (pDiff !== 0) return pDiff;
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const filterTabs: { key: Filter; label: string }[] = [
    { key: 'mine', label: selfName },
    { key: 'theirs', label: otherName },
    { key: 'all', label: '全員' },
  ];

  const todoCount = filtered.filter(t => t.status === 'todo').length;

  return (
    <div className="max-w-lg mx-auto px-4 py-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-white/90 font-bold text-lg">
            {todoCount > 0 ? `${todoCount} 件のタスク` : 'すべて完了 🎉'}
          </p>
        </div>
        <button
          onClick={() => setShowDone(v => !v)}
          className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${
            showDone
              ? 'bg-accent-500/15 text-accent-400 border border-accent-500/20'
              : 'text-white/30 border border-white/10'
          }`}
        >
          {showDone ? '完了表示中' : '完了を表示'}
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-5 p-1 rounded-2xl border border-white/[0.06]" style={{ backgroundColor: '#111119' }}>
        {filterTabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all min-h-[36px] ${
              filter === key
                ? 'bg-primary-500 text-white shadow'
                : 'text-white/30 active:text-white/60'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.06] text-center py-16" style={{ backgroundColor: '#111119' }}>
          <p className="text-4xl mb-3">✦</p>
          <p className="text-white/25 text-sm font-medium">タスクがありません</p>
        </div>
      ) : (
        <div className="space-y-2 pb-24">
          {filtered.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              currentUser={currentUser}
              settings={settings}
              onToggleDone={onToggleDone}
              onPin={onPin}
              onOpen={onOpen}
            />
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={onAdd}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-2xl text-white text-2xl flex items-center justify-center z-20 shadow-lg transition-all active:scale-95"
        style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)' }}
      >
        +
      </button>
    </div>
  );
}

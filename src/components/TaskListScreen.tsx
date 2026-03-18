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
    { key: 'mine', label: '自分' },
    { key: 'theirs', label: '相手' },
    { key: 'all', label: '全員' },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">📋 タスク</h2>
        <button
          onClick={() => setShowDone(v => !v)}
          className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${showDone ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
        >
          {showDone ? '✓ 完了表示中' : '完了を表示'}
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
        {filterTabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors min-h-[36px] ${filter === key ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-3">🎉</div>
          <p className="text-gray-500">タスクはありません</p>
        </div>
      ) : (
        <div className="space-y-3 pb-20">
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
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary-500 text-white rounded-full shadow-lg text-2xl flex items-center justify-center active:bg-primary-700 z-20"
      >
        ＋
      </button>
    </div>
  );
}

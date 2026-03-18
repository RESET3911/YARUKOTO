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

  const todoCount = filtered.filter(t => t.status === 'todo').length;

  const filterTabs: { key: Filter; label: string }[] = [
    { key: 'mine', label: selfName },
    { key: 'theirs', label: otherName },
    { key: 'all', label: '全員' },
  ];

  return (
    <div className="px-4 py-5">
      {/* Filter + toggle row */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex flex-1 bg-white rounded-2xl border border-gray-100 p-1 gap-1 shadow-sm">
          {filterTabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all min-h-[36px] ${
                filter === key
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-gray-400 active:text-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowDone(v => !v)}
          className={`text-xs px-3 py-2 rounded-2xl font-bold border transition-all min-h-[44px] ${
            showDone
              ? 'bg-green-50 text-green-600 border-green-200'
              : 'bg-white text-gray-400 border-gray-100'
          }`}
        >
          完了
        </button>
      </div>

      {/* Count */}
      {todoCount > 0 && (
        <p className="text-xs text-gray-400 font-semibold mb-3 px-1">
          {todoCount}件 未完了
        </p>
      )}

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 text-center py-16 shadow-sm">
          <p className="text-3xl mb-3">🎉</p>
          <p className="text-gray-400 font-semibold text-sm">タスクがありません</p>
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
        className="fixed bottom-24 right-5 w-14 h-14 rounded-2xl text-white text-2xl font-light flex items-center justify-center z-20 shadow-lg transition-all active:scale-95"
        style={{ background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)' }}
      >
        +
      </button>
    </div>
  );
}

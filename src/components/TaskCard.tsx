import { Task, User, Priority } from '../types';
import { POINTS } from '../utils/points';

type Props = {
  task: Task;
  currentUser: User;
  settings: { userA: { name: string }; userB: { name: string } };
  onToggleDone: (task: Task) => void;
  onPin: (task: Task) => void;
  onOpen: (task: Task) => void;
};

const PRIORITY_BAR: Record<Priority, string> = {
  urgent: 'bg-red-400',
  high:   'bg-orange-400',
  medium: 'bg-primary-400',
  low:    'bg-gray-200',
};

export default function TaskCard({ task, settings, onToggleDone, onPin, onOpen }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const isOverdue = task.dueDate && task.dueDate < today && task.status === 'todo';
  const isDueToday = task.dueDate === today && task.status === 'todo';
  const isDone = task.status === 'done';

  const assigneeName =
    task.assignee === 'both' ? '2人' :
    task.assignee === 'A' ? settings.userA.name : settings.userB.name;

  const completedByName = task.completedBy
    ? (task.completedBy === 'A' ? settings.userA.name : settings.userB.name)
    : '';

  return (
    <div className={`bg-white rounded-3xl border overflow-hidden transition-all active:scale-[0.99] ${
      task.pinned ? 'border-primary-200' : 'border-gray-100'
    }`}>
      <div className="flex items-stretch">
        {/* Priority bar */}
        <div className={`w-1 flex-shrink-0 ${PRIORITY_BAR[task.priority]} ${isDone ? 'opacity-30' : ''}`} />

        <div className="flex items-start gap-3 px-4 py-3.5 flex-1 min-w-0">
          {/* Checkbox */}
          <button
            onClick={() => onToggleDone(task)}
            className={`mt-0.5 w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
              isDone
                ? 'bg-green-500 border-green-500'
                : task.priority === 'urgent' ? 'border-red-300 active:border-red-400'
                : task.priority === 'high' ? 'border-orange-300 active:border-orange-400'
                : 'border-gray-200 active:border-primary-300'
            }`}
          >
            {isDone && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0" onClick={() => onOpen(task)}>
            <div className="flex items-center gap-1.5 mb-1">
              {task.pinned && <span className="text-primary-400 text-xs">📌</span>}
              <p className={`font-bold text-sm leading-snug ${isDone ? 'line-through text-gray-300' : 'text-gray-900'}`}>
                {task.title}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {task.category && (
                <span className="text-xs bg-accent-50 text-accent-600 font-semibold px-2 py-0.5 rounded-full border border-accent-100">
                  {task.category}
                </span>
              )}
              <span className="text-xs text-gray-400 font-medium">{assigneeName}</span>
              {task.recurring && <span className="text-xs text-primary-400 font-semibold">↻</span>}
              {task.subtasks.length > 0 && (
                <span className="text-xs text-gray-400">
                  {task.subtasks.filter(s => s.done).length}/{task.subtasks.length}
                </span>
              )}
            </div>

            {task.dueDate && !isDone && (
              <p className={`text-xs mt-1 font-semibold ${
                isOverdue ? 'text-red-500' : isDueToday ? 'text-amber-500' : 'text-gray-400'
              }`}>
                {isOverdue ? '⚠ 期限切れ · ' : isDueToday ? '⏰ 今日 · ' : '📅 '}{task.dueDate}
              </p>
            )}

            {isDone && completedByName && (
              <p className="text-xs text-green-500 font-semibold mt-1">
                ✓ {completedByName} · {POINTS[task.priority]}pt
              </p>
            )}
          </div>

          {/* Pin button */}
          <button
            onClick={() => onPin(task)}
            className={`p-1.5 flex-shrink-0 transition-colors ${task.pinned ? 'text-primary-400' : 'text-gray-200 active:text-gray-400'}`}
          >
            📌
          </button>
        </div>
      </div>
    </div>
  );
}

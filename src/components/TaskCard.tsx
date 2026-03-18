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

const PRIORITY_ACCENT: Record<Priority, string> = {
  urgent: '#f43f5e',
  high:   '#fb923c',
  medium: '#60a5fa',
  low:    'rgba(255,255,255,0.1)',
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
    <div
      className="relative rounded-2xl border border-white/[0.06] overflow-hidden transition-all active:scale-[0.99]"
      style={{ backgroundColor: '#111119' }}
    >
      {/* Priority accent line */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ backgroundColor: PRIORITY_ACCENT[task.priority] }}
      />

      <div className="flex items-start gap-3 pl-4 pr-3 py-3.5">
        {/* Checkbox */}
        <button
          onClick={() => onToggleDone(task)}
          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
            isDone
              ? 'border-accent-500 bg-accent-500'
              : 'border-white/20 active:border-primary-400'
          }`}
        >
          {isDone && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0" onClick={() => onOpen(task)}>
          <div className="flex items-start gap-1.5 mb-1.5">
            {task.pinned && <span className="text-primary-400 text-xs mt-0.5">◈</span>}
            <p className={`font-semibold text-sm leading-snug ${isDone ? 'line-through text-white/25' : 'text-white/90'}`}>
              {task.title}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-semibold ${
              task.priority === 'urgent' ? 'text-rose-400' :
              task.priority === 'high' ? 'text-orange-400' :
              task.priority === 'medium' ? 'text-blue-400' : 'text-white/25'
            }`}>
              {task.priority === 'urgent' ? '緊急' : task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
            </span>
            {task.category && (
              <span className="text-[11px] text-white/35 font-medium">{task.category}</span>
            )}
            <span className="text-[11px] text-white/25">{assigneeName}</span>
            {task.recurring && <span className="text-[11px] text-primary-400/60">↻</span>}
            {task.subtasks.length > 0 && (
              <span className="text-[11px] text-white/25">
                {task.subtasks.filter(s => s.done).length}/{task.subtasks.length}
              </span>
            )}
          </div>

          {task.dueDate && !isDone && (
            <p className={`text-xs mt-1.5 font-medium ${
              isOverdue ? 'text-rose-400' : isDueToday ? 'text-amber-400' : 'text-white/25'
            }`}>
              {isOverdue ? '期限切れ ' : isDueToday ? '今日まで ' : ''}{task.dueDate}
            </p>
          )}

          {isDone && completedByName && (
            <p className="text-[11px] text-accent-500/70 mt-1">{completedByName} が完了 · {POINTS[task.priority]}pt</p>
          )}
        </div>

        {/* Pin button */}
        <button
          onClick={() => onPin(task)}
          className={`text-sm p-1.5 flex-shrink-0 transition-colors ${task.pinned ? 'text-primary-400' : 'text-white/15 active:text-white/40'}`}
        >
          ◈
        </button>
      </div>
    </div>
  );
}

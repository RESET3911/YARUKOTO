import { Task, User } from '../types';
import PriorityBadge from './PriorityBadge';

type Props = {
  task: Task;
  currentUser: User;
  settings: { userA: { name: string }; userB: { name: string } };
  onToggleDone: (task: Task) => void;
  onPin: (task: Task) => void;
  onOpen: (task: Task) => void;
};

export default function TaskCard({ task, settings, onToggleDone, onPin, onOpen }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const isOverdue = task.dueDate && task.dueDate < today && task.status === 'todo';
  const isDueToday = task.dueDate === today && task.status === 'todo';

  const assigneeName =
    task.assignee === 'both' ? '2人' :
    task.assignee === 'A' ? settings.userA.name : settings.userB.name;

  const completedByName = task.completedBy
    ? (task.completedBy === 'A' ? settings.userA.name : settings.userB.name)
    : '';

  return (
    <div
      className={`card ${task.pinned ? 'border-l-4 border-primary-400' : ''} ${task.status === 'done' ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggleDone(task)}
          className={`mt-0.5 w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
            task.status === 'done'
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 active:border-primary-400'
          }`}
        >
          {task.status === 'done' && <span className="text-xs">✓</span>}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0" onClick={() => onOpen(task)}>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {task.pinned && <span className="text-xs">📌</span>}
            <p className={`font-semibold text-gray-900 ${task.status === 'done' ? 'line-through text-gray-400' : ''}`}>
              {task.title}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <PriorityBadge priority={task.priority} />
            {task.category && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{task.category}</span>
            )}
            <span className="text-xs text-gray-400">{assigneeName}</span>
            {task.recurring && <span className="text-xs text-blue-500">🔁</span>}
          </div>

          {task.dueDate && (
            <p className={`text-xs mt-1 ${isOverdue ? 'text-red-500 font-semibold' : isDueToday ? 'text-orange-500 font-semibold' : 'text-gray-400'}`}>
              {isOverdue ? '⚠️ 期限切れ: ' : isDueToday ? '⏰ 今日: ' : '📅 '}{task.dueDate}
            </p>
          )}

          {task.status === 'done' && completedByName && (
            <p className="text-xs text-green-500 mt-1">✓ {completedByName}が完了</p>
          )}

          {task.subtasks.length > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              サブタスク {task.subtasks.filter(s => s.done).length}/{task.subtasks.length}
            </p>
          )}
        </div>

        {/* Pin button */}
        <button
          onClick={() => onPin(task)}
          className={`text-lg p-1 flex-shrink-0 ${task.pinned ? 'text-primary-500' : 'text-gray-300'}`}
        >
          📌
        </button>
      </div>
    </div>
  );
}

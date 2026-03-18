import { useState } from 'react';
import { Task, User, Settings, Comment, Subtask } from '../types';
import { v4 as uuidv4 } from 'uuid';
import PriorityBadge from './PriorityBadge';
import ConfirmModal from './ConfirmModal';
import { POINTS } from '../utils/points';

type Props = {
  task: Task;
  currentUser: User;
  settings: Settings;
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onBack: () => void;
};

export default function TaskDetailScreen({ task, currentUser, settings, onUpdate, onDelete, onEdit, onBack }: Props) {
  const [commentText, setCommentText] = useState('');
  const [showDelete, setShowDelete] = useState(false);

  const getName = (user: User) => user === 'A' ? settings.userA.name : settings.userB.name;

  const toggleSubtask = (subtask: Subtask) => {
    const subtasks = task.subtasks.map(s => s.id === subtask.id ? { ...s, done: !s.done } : s);
    onUpdate({ ...task, subtasks });
  };

  const addComment = () => {
    if (!commentText.trim()) return;
    const comment: Comment = {
      id: uuidv4(),
      author: currentUser,
      text: commentText.trim(),
      createdAt: new Date().toISOString(),
    };
    onUpdate({ ...task, comments: [...task.comments, comment] });
    setCommentText('');
  };

  const assigneeName =
    task.assignee === 'both' ? '2人' :
    task.assignee === 'A' ? settings.userA.name : settings.userB.name;

  const isDone = task.status === 'done';

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#0a0a0f' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-white/[0.06]" style={{ backgroundColor: '#0a0a0f' }}>
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="text-white/40 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-xl">←</button>
          <div className="flex-1 min-w-0">
            <p className="text-white/90 font-bold truncate">{task.title}</p>
          </div>
          <button
            onClick={() => onEdit(task)}
            className="text-primary-400 text-sm font-semibold px-3 py-1.5 rounded-xl border border-primary-400/30 active:bg-primary-500/10"
          >
            編集
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-3">

        {/* Title + badges */}
        <div className="rounded-2xl border border-white/[0.06] p-5" style={{ backgroundColor: '#111119' }}>
          <h2 className={`text-xl font-black mb-3 ${isDone ? 'line-through text-white/25' : 'text-white'}`}>
            {task.title}
          </h2>
          <div className="flex items-center gap-3 flex-wrap">
            <PriorityBadge priority={task.priority} />
            {task.category && (
              <span className="text-xs text-white/35 font-medium">{task.category}</span>
            )}
            <span className="text-xs font-bold text-primary-400">{POINTS[task.priority]}pt</span>
            {isDone && <span className="text-xs text-accent-400 font-semibold">✓ 完了</span>}
          </div>
        </div>

        {/* Info */}
        <div className="rounded-2xl border border-white/[0.06] p-4 space-y-3" style={{ backgroundColor: '#111119' }}>
          {[
            { label: '担当者', value: assigneeName },
            { label: '作成者', value: getName(task.createdBy) },
            ...(task.dueDate ? [{ label: '期限', value: task.dueDate }] : []),
            ...(task.recurring ? [{ label: '繰り返し', value: task.recurring.type === 'daily' ? '毎日' : task.recurring.type === 'weekly' ? '毎週' : '毎月' }] : []),
            ...(isDone && task.completedBy ? [{ label: '完了者', value: getName(task.completedBy) }] : []),
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-xs text-white/30 font-semibold uppercase tracking-wide">{label}</span>
              <span className="text-sm text-white/70 font-medium">{value}</span>
            </div>
          ))}
        </div>

        {/* Description */}
        {task.description && (
          <div className="rounded-2xl border border-white/[0.06] p-4" style={{ backgroundColor: '#111119' }}>
            <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-2">メモ</p>
            <p className="text-sm text-white/60 leading-relaxed">{task.description}</p>
          </div>
        )}

        {/* Subtasks */}
        {task.subtasks.length > 0 && (
          <div className="rounded-2xl border border-white/[0.06] p-4" style={{ backgroundColor: '#111119' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest">サブタスク</p>
              <span className="text-xs text-white/40 font-semibold">
                {task.subtasks.filter(s => s.done).length}/{task.subtasks.length}
              </span>
            </div>
            <div className="space-y-2">
              {task.subtasks.map(st => (
                <button
                  key={st.id}
                  onClick={() => toggleSubtask(st)}
                  className="flex items-center gap-3 w-full text-left min-h-[40px]"
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    st.done ? 'border-accent-500 bg-accent-500' : 'border-white/20'
                  }`}>
                    {st.done && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm flex-1 ${st.done ? 'line-through text-white/25' : 'text-white/70'}`}>{st.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <div className="rounded-2xl border border-white/[0.06] p-4" style={{ backgroundColor: '#111119' }}>
          <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-3">
            コメント {task.comments.length > 0 && `· ${task.comments.length}`}
          </p>
          {task.comments.length > 0 && (
            <div className="space-y-3 mb-3">
              {task.comments.map(c => {
                const isMine = c.author === currentUser;
                return (
                  <div key={c.id} className={`flex gap-2 ${isMine ? 'flex-row-reverse' : ''}`}>
                    <div
                      className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm ${
                        isMine ? 'text-white' : 'text-white/70'
                      }`}
                      style={{ backgroundColor: isMine ? '#4f46e5' : '#1a1a2a' }}
                    >
                      <p className="text-[10px] font-bold mb-0.5 opacity-60">{getName(c.author)}</p>
                      <p className="leading-relaxed">{c.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addComment(); }}
              placeholder="コメントを入力..."
              className="input-field flex-1 py-2 text-sm"
            />
            <button
              onClick={addComment}
              disabled={!commentText.trim()}
              className="btn-primary px-4 py-2 rounded-xl text-sm"
            >送信</button>
          </div>
        </div>

        {/* Delete */}
        <button
          onClick={() => setShowDelete(true)}
          className="w-full py-3 rounded-2xl text-sm font-semibold text-rose-400/60 border border-rose-500/10 active:bg-rose-500/5 transition-all"
        >
          タスクを削除
        </button>
      </div>

      {showDelete && (
        <ConfirmModal
          title="タスクを削除"
          message={`「${task.title}」を削除しますか？`}
          confirmLabel="削除する"
          isDanger
          onConfirm={() => { onDelete(task.id); onBack(); }}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </div>
  );
}

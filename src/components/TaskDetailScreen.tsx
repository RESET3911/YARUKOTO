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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="text-gray-400 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-lg">←</button>
          <p className="flex-1 font-black text-gray-900 truncate">{task.title}</p>
          <button
            onClick={() => onEdit(task)}
            className="text-primary-500 font-bold text-sm px-3 py-1.5 bg-primary-50 rounded-2xl border border-primary-200 active:bg-primary-100"
          >
            編集
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-3 pb-10">

        {/* Title card */}
        <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
          <h2 className={`text-xl font-black mb-3 ${isDone ? 'line-through text-gray-300' : 'text-gray-900'}`}>
            {task.title}
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <PriorityBadge priority={task.priority} />
            {task.category && (
              <span className="text-xs bg-accent-50 text-accent-600 font-semibold px-2 py-0.5 rounded-full border border-accent-100">
                {task.category}
              </span>
            )}
            <span className="text-xs font-bold text-primary-500">{POINTS[task.priority]}pt</span>
            {isDone && <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full">✓ 完了</span>}
          </div>
        </div>

        {/* Info */}
        <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
          <div className="space-y-3">
            {[
              { label: '担当者', value: assigneeName },
              { label: '作成者', value: getName(task.createdBy) },
              ...(task.dueDate ? [{ label: '期限', value: task.dueDate }] : []),
              ...(task.recurring ? [{ label: '繰り返し', value: task.recurring.type === 'daily' ? '毎日' : task.recurring.type === 'weekly' ? '毎週' : '毎月' }] : []),
              ...(isDone && task.completedBy ? [{ label: '完了者', value: getName(task.completedBy) }] : []),
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</span>
                <span className="text-sm text-gray-700 font-semibold">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">メモ</p>
            <p className="text-sm text-gray-600 leading-relaxed">{task.description}</p>
          </div>
        )}

        {/* Subtasks */}
        {task.subtasks.length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">サブタスク</p>
              <span className="text-xs font-bold text-gray-400">
                {task.subtasks.filter(s => s.done).length}/{task.subtasks.length}
              </span>
            </div>
            <div className="space-y-2">
              {task.subtasks.map(st => (
                <button key={st.id} onClick={() => toggleSubtask(st)} className="flex items-center gap-3 w-full text-left min-h-[40px]">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    st.done ? 'bg-green-500 border-green-500' : 'border-gray-200'
                  }`}>
                    {st.done && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm flex-1 font-medium ${st.done ? 'line-through text-gray-300' : 'text-gray-700'}`}>{st.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            コメント {task.comments.length > 0 && `· ${task.comments.length}`}
          </p>
          {task.comments.length > 0 && (
            <div className="space-y-3 mb-3">
              {task.comments.map(c => {
                const isMine = c.author === currentUser;
                return (
                  <div key={c.id} className={`flex gap-2 ${isMine ? 'flex-row-reverse' : ''}`}>
                    <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                      isMine ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700'
                    }`}>
                      <p className="text-[10px] font-bold mb-0.5 opacity-70">{getName(c.author)}</p>
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
              className="input-field flex-1 py-2.5 text-sm"
            />
            <button onClick={addComment} disabled={!commentText.trim()} className="btn-primary px-4 py-2 rounded-2xl text-sm">送信</button>
          </div>
        </div>

        {/* Delete */}
        <button
          onClick={() => setShowDelete(true)}
          className="w-full py-3.5 rounded-3xl text-sm font-bold text-red-400 bg-white border border-gray-100 active:bg-red-50 transition-all shadow-sm"
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

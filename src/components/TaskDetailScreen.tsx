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

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-20">
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <button onClick={onBack} className="text-gray-500 p-2 -ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center">←</button>
        <div className="flex-1">
          <h2 className={`text-xl font-bold text-gray-900 ${task.status === 'done' ? 'line-through text-gray-400' : ''}`}>{task.title}</h2>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <PriorityBadge priority={task.priority} />
            {task.category && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{task.category}</span>}
            <span className="text-xs text-primary-600 font-semibold">{POINTS[task.priority]}pt</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Info card */}
        <div className="card space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">担当者</span><span className="font-medium">{assigneeName}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">作成者</span><span className="font-medium">{getName(task.createdBy)}</span></div>
          {task.dueDate && <div className="flex justify-between"><span className="text-gray-500">期限</span><span className="font-medium">{task.dueDate}</span></div>}
          {task.recurring && <div className="flex justify-between"><span className="text-gray-500">繰り返し</span><span className="font-medium">🔁 {task.recurring.type === 'daily' ? '毎日' : task.recurring.type === 'weekly' ? '毎週' : '毎月'}</span></div>}
          {task.status === 'done' && task.completedBy && (
            <div className="flex justify-between"><span className="text-gray-500">完了者</span><span className="font-medium text-green-600">✓ {getName(task.completedBy)}</span></div>
          )}
        </div>

        {/* Description */}
        {task.description && (
          <div className="card">
            <p className="text-sm font-semibold text-gray-700 mb-1">メモ</p>
            <p className="text-sm text-gray-600">{task.description}</p>
          </div>
        )}

        {/* Subtasks */}
        {task.subtasks.length > 0 && (
          <div className="card">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              サブタスク ({task.subtasks.filter(s => s.done).length}/{task.subtasks.length})
            </p>
            <div className="space-y-2">
              {task.subtasks.map(st => (
                <button key={st.id} onClick={() => toggleSubtask(st)} className="flex items-center gap-3 w-full text-left min-h-[36px]">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${st.done ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}>
                    {st.done && <span className="text-xs">✓</span>}
                  </div>
                  <span className={`text-sm ${st.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>{st.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <div className="card">
          <p className="text-sm font-semibold text-gray-700 mb-3">コメント ({task.comments.length})</p>
          {task.comments.length > 0 && (
            <div className="space-y-3 mb-3">
              {task.comments.map(c => (
                <div key={c.id} className={`flex gap-2 ${c.author === currentUser ? 'flex-row-reverse' : ''}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${c.author === currentUser ? 'bg-primary-100 text-primary-900' : 'bg-gray-100 text-gray-700'}`}>
                    <p className="text-xs font-semibold mb-0.5 opacity-70">{getName(c.author)}</p>
                    <p>{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addComment(); }}
              placeholder="コメントを入力..."
              className="input-field flex-1 py-2"
            />
            <button onClick={addComment} disabled={!commentText.trim()} className="btn-primary px-4 py-2 rounded-xl text-sm">送信</button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={() => onEdit(task)} className="flex-1 btn-secondary text-sm">✏️ 編集</button>
          <button onClick={() => setShowDelete(true)} className="flex-1 btn-danger text-sm">🗑️ 削除</button>
        </div>
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

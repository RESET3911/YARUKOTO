import { useState, useCallback, useEffect } from 'react';
import { User, Settings, Task } from './types';
import { defaultSettings, saveSettings, saveTask, updateTask, deleteTask, subscribeSettings, subscribeTasks } from './utils/storage';
import { notifyAssigned, notifyCompleted, notifyDueReminder } from './utils/notify';
import { calcNextDue } from './utils/recurring';
import { v4 as uuidv4 } from 'uuid';
import Toast from './components/Toast';
import HomeScreen from './components/HomeScreen';
import TaskListScreen from './components/TaskListScreen';
import AddTaskScreen from './components/AddTaskScreen';
import TaskDetailScreen from './components/TaskDetailScreen';
import StatsScreen from './components/StatsScreen';
import SettingsScreen from './components/SettingsScreen';

type Screen = 'home' | 'tasks' | 'add' | 'detail' | 'stats' | 'settings';

export default function App() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [screen, setScreen] = useState<Screen>('home');
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const unsubS = subscribeSettings(s => { setSettings(s); setLoading(false); });
    const unsubT = subscribeTasks(t => setTasks(t));
    return () => { unsubS(); unsubT(); };
  }, []);

  useEffect(() => {
    if (loading || !settings.ntfyTopic) return;
    const today = new Date().toISOString().slice(0, 10);
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const dueSoon = tasks.filter(t =>
      t.status === 'todo' && t.dueDate && (t.dueDate === today || t.dueDate === tomorrow)
    );
    dueSoon.forEach(t => notifyDueReminder(t, settings).catch(() => {}));
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    setScreen('tasks');
  };

  const handleSaveSettings = useCallback((s: Settings) => {
    setSettings(s);
    saveSettings(s);
  }, []);

  const handleToggleDone = useCallback((task: Task) => {
    if (!currentUser) return;
    const isDone = task.status === 'todo';
    const now = new Date().toISOString();
    const updated: Task = {
      ...task,
      status: isDone ? 'done' : 'todo',
      ...(isDone ? { completedBy: currentUser, completedAt: now } : { completedBy: undefined, completedAt: undefined }),
    };
    setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
    updateTask(task.id, {
      status: updated.status,
      completedBy: updated.completedBy,
      completedAt: updated.completedAt,
    }).catch(() => setToast('更新に失敗しました'));

    if (isDone) {
      notifyCompleted(task, settings, currentUser).catch(() => {});
      if (task.recurring) {
        const nextTask: Task = {
          ...task,
          id: uuidv4(),
          status: 'todo',
          pinned: false,
          completedBy: undefined,
          completedAt: undefined,
          createdAt: now,
          comments: [],
          dueDate: calcNextDue(task.recurring),
          recurring: { ...task.recurring, nextDue: calcNextDue(task.recurring) },
        };
        setTasks(prev => [...prev, nextTask]);
        saveTask(nextTask).catch(() => {});
      }
    }
  }, [currentUser, settings]);

  const handlePin = useCallback((task: Task) => {
    const updated = { ...task, pinned: !task.pinned };
    setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
    updateTask(task.id, { pinned: updated.pinned }).catch(() => {});
  }, []);

  const handleSaveTask = useCallback((task: Task) => {
    const isNew = !tasks.find(t => t.id === task.id);
    setTasks(prev => isNew ? [...prev, task] : prev.map(t => t.id === task.id ? task : t));
    saveTask(task).catch(() => setToast('保存に失敗しました'));
    if (currentUser && isNew && task.assignee !== currentUser) {
      notifyAssigned(task, settings, task.assignee === 'both' ? (currentUser === 'A' ? 'B' : 'A') : task.assignee).catch(() => {});
    }
    setToast(isNew ? 'タスクを追加しました' : 'タスクを更新しました');
    setEditingTask(undefined);
    setScreen('tasks');
  }, [tasks, currentUser, settings]);

  const handleUpdateTask = useCallback((task: Task) => {
    setTasks(prev => prev.map(t => t.id === task.id ? task : t));
    saveTask(task).catch(() => {});
    setSelectedTask(task);
  }, []);

  const handleDeleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    deleteTask(id).catch(() => {});
    setToast('タスクを削除しました');
  }, []);

  const pendingCount = currentUser
    ? tasks.filter(t => t.status === 'todo' && (t.assignee === currentUser || t.assignee === 'both')).length
    : 0;

  const tabs = [
    { key: 'tasks' as Screen, label: 'タスク', icon: '✓' },
    { key: 'stats' as Screen, label: '統計', icon: '◑' },
    { key: 'settings' as Screen, label: '設定', icon: '◎' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-50 to-white">
        <div className="text-center">
          <div className="text-5xl mb-3">{defaultSettings.appIcon}</div>
          <p className="text-gray-300 text-sm tracking-widest">loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser || screen === 'home') {
    return <HomeScreen settings={settings} tasks={tasks} onSelectUser={handleSelectUser} />;
  }

  if (screen === 'detail' && selectedTask) {
    return (
      <TaskDetailScreen
        task={tasks.find(t => t.id === selectedTask.id) ?? selectedTask}
        currentUser={currentUser}
        settings={settings}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
        onEdit={task => { setEditingTask(task); setScreen('add'); }}
        onBack={() => setScreen('tasks')}
      />
    );
  }

  if (screen === 'add') {
    return (
      <AddTaskScreen
        currentUser={currentUser}
        settings={settings}
        editTask={editingTask}
        onSubmit={handleSaveTask}
        onCancel={() => { setEditingTask(undefined); setScreen('tasks'); }}
      />
    );
  }

  const userName = currentUser === 'A' ? settings.userA.name : settings.userB.name;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => { setCurrentUser(null); setScreen('home'); }}
            className="text-gray-400 p-2 -ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-lg hover:text-gray-600 transition-colors"
          >←</button>
          <div className="text-center">
            <p className="font-black text-gray-900 text-sm tracking-wide">{settings.appIcon} uni</p>
            <p className="text-xs text-primary-500 font-semibold">{userName}モード</p>
          </div>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-lg mx-auto">
        {screen === 'tasks' && (
          <TaskListScreen
            currentUser={currentUser}
            settings={settings}
            tasks={tasks}
            onToggleDone={handleToggleDone}
            onPin={handlePin}
            onOpen={task => { setSelectedTask(task); setScreen('detail'); }}
            onAdd={() => { setEditingTask(undefined); setScreen('add'); }}
          />
        )}
        {screen === 'stats' && <StatsScreen settings={settings} tasks={tasks} />}
        {screen === 'settings' && <SettingsScreen settings={settings} onSave={handleSaveSettings} />}
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-10">
        <div className="max-w-lg mx-auto flex items-stretch">
          {tabs.map(tab => {
            const isActive = screen === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setScreen(tab.key)}
                className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 min-h-[60px] transition-all relative ${
                  isActive ? 'text-primary-500' : 'text-gray-300'
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary-400 rounded-full" />
                )}
                <span className="text-base font-black relative">
                  {tab.icon}
                  {tab.key === 'tasks' && pendingCount > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {pendingCount > 9 ? '9+' : pendingCount}
                    </span>
                  )}
                </span>
                <span className={`text-[10px] font-bold tracking-wide ${isActive ? 'text-primary-500' : 'text-gray-300'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

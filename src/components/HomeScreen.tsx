import { User, Settings, Task } from '../types';
import { POINTS } from '../utils/points';

type Props = {
  settings: Settings;
  tasks: Task[];
  onSelectUser: (user: User) => void;
};

export default function HomeScreen({ settings, tasks, onSelectUser }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const thisMonth = new Date().toISOString().slice(0, 7);

  const myTaskCount = (user: User) =>
    tasks.filter(t => t.status === 'todo' && (t.assignee === user || t.assignee === 'both')).length;

  const monthPoints = (user: User) =>
    tasks
      .filter(t => t.status === 'done' && t.completedBy === user && t.completedAt?.startsWith(thisMonth))
      .reduce((sum, t) => sum + POINTS[t.priority], 0);

  const todayDue = tasks.filter(t => t.status === 'todo' && t.dueDate === today).length;

  const pA = monthPoints('A');
  const pB = monthPoints('B');
  const maxP = Math.max(pA, pB, 1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
            {settings.appIcon} uni
          </h1>
          <p className="text-gray-500 mt-2 text-sm">2人のやることリスト</p>
        </div>

        {/* Today alert */}
        {todayDue > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-6 flex items-center gap-2">
            <span>⏰</span>
            <p className="text-sm text-orange-700 font-medium">今日期限のタスクが{todayDue}件あります</p>
          </div>
        )}

        {/* User buttons */}
        <p className="text-center text-gray-600 font-medium mb-4">どちらで使いますか？</p>
        <div className="flex gap-4 mb-8">
          {(['A', 'B'] as User[]).map(user => {
            const name = user === 'A' ? settings.userA.name : settings.userB.name;
            const count = myTaskCount(user);
            return (
              <button
                key={user}
                onClick={() => onSelectUser(user)}
                className="flex-1 bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center gap-3 active:bg-primary-50 transition-colors border-2 border-transparent active:border-primary-200 min-h-[140px]"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-300 to-accent-400 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                    {name.charAt(0)}
                  </div>
                  {count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow">
                      {count}
                    </span>
                  )}
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-900 text-lg">{name}</p>
                  <p className="text-sm text-gray-400 mt-1">{count > 0 ? `残り${count}件` : 'なし'}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Points comparison */}
        <div className="card mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">今月のポイント</p>
          {(['A', 'B'] as User[]).map(user => {
            const name = user === 'A' ? settings.userA.name : settings.userB.name;
            const pts = user === 'A' ? pA : pB;
            return (
              <div key={user} className="mb-3 last:mb-0">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{name}</span>
                  <span className="font-bold text-primary-600">{pts}pt</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-400 to-accent-400 rounded-full transition-all"
                    style={{ width: `${(pts / maxP) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: '未完了', count: tasks.filter(t => t.status === 'todo').length, color: 'text-blue-500' },
            { label: '完了済', count: tasks.filter(t => t.status === 'done').length, color: 'text-green-500' },
            { label: '今日期限', count: todayDue, color: 'text-orange-500' },
          ].map(({ label, count, color }) => (
            <div key={label} className="card text-center">
              <p className={`text-2xl font-bold ${color}`}>{count}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

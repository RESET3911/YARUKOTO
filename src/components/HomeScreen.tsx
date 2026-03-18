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
  const totalTodo = tasks.filter(t => t.status === 'todo').length;
  const totalDone = tasks.filter(t => t.status === 'done').length;

  const pA = monthPoints('A');
  const pB = monthPoints('B');
  const maxP = Math.max(pA, pB, 1);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header band */}
      <div className="bg-gradient-to-br from-primary-500 to-accent-500 px-5 pt-12 pb-16">
        <p className="text-white/60 text-xs font-semibold tracking-widest uppercase mb-1">2人のやることリスト</p>
        <h1 className="text-4xl font-black text-white">{settings.appIcon} uni</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-8">

        {/* Today alert */}
        {todayDue > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-4 flex items-center gap-2.5">
            <span className="text-amber-500">⏰</span>
            <p className="text-sm text-amber-700 font-semibold">今日期限のタスクが <span className="font-black">{todayDue}件</span></p>
          </div>
        )}

        {/* User selection */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {(['A', 'B'] as User[]).map(user => {
            const name = user === 'A' ? settings.userA.name : settings.userB.name;
            const count = myTaskCount(user);
            const isA = user === 'A';
            return (
              <button
                key={user}
                onClick={() => onSelectUser(user)}
                className="bg-white rounded-3xl p-5 flex flex-col items-center gap-3 min-h-[150px] border border-gray-100 active:scale-95 transition-all shadow-sm"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-md"
                  style={{
                    background: isA
                      ? 'linear-gradient(135deg, #38bdf8, #0ea5e9)'
                      : 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
                  }}
                >
                  {name.charAt(0)}
                </div>
                <div className="text-center">
                  <p className="font-black text-gray-900">{name}</p>
                  <p className={`text-xs mt-0.5 font-semibold ${count > 0 ? 'text-primary-500' : 'text-gray-300'}`}>
                    {count > 0 ? `${count}件 残り` : 'すべて完了'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Points */}
        <div className="bg-white rounded-3xl border border-gray-100 p-5 mb-3 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">今月のポイント</p>
          {(['A', 'B'] as User[]).map(user => {
            const name = user === 'A' ? settings.userA.name : settings.userB.name;
            const pts = user === 'A' ? pA : pB;
            const isA = user === 'A';
            return (
              <div key={user} className="mb-4 last:mb-0">
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className="text-sm text-gray-600 font-semibold">{name}</span>
                  <span className={`text-base font-black ${isA ? 'text-primary-500' : 'text-accent-500'}`}>
                    {pts}<span className="text-xs font-normal text-gray-400 ml-0.5">pt</span>
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(pts / maxP) * 100}%`,
                      background: isA
                        ? 'linear-gradient(90deg, #38bdf8, #0ea5e9)'
                        : 'linear-gradient(90deg, #a78bfa, #8b5cf6)',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 pb-8">
          {[
            { label: '未完了', value: totalTodo, color: 'text-primary-500' },
            { label: '完了済', value: totalDone, color: 'text-green-500' },
            { label: '今日期限', value: todayDue, color: 'text-amber-500' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-3 text-center shadow-sm">
              <p className={`text-2xl font-black ${color}`}>{value}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

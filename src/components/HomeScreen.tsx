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

  const totalTodo = tasks.filter(t => t.status === 'todo').length;
  const totalDone = tasks.filter(t => t.status === 'done').length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0f' }}>
      <div className="max-w-lg mx-auto px-5 py-10">

        {/* Header */}
        <div className="mb-10">
          <p className="text-white/25 text-xs tracking-[0.2em] uppercase mb-2">2人のやることリスト</p>
          <h1 className="text-5xl font-black text-white tracking-tight">
            {settings.appIcon} <span className="text-primary-400">uni</span>
          </h1>
        </div>

        {/* Due today alert */}
        {todayDue > 0 && (
          <div className="mb-6 rounded-2xl border border-amber-500/20 px-4 py-3 flex items-center gap-3" style={{ backgroundColor: 'rgba(251,191,36,0.06)' }}>
            <span className="text-amber-400 text-lg">⚡</span>
            <p className="text-sm text-amber-300/80 font-medium">今日期限のタスクが <span className="text-amber-300 font-bold">{todayDue}件</span></p>
          </div>
        )}

        {/* User selection */}
        <p className="text-white/25 text-xs tracking-[0.15em] uppercase mb-4">だれで使う？</p>
        <div className="flex gap-3 mb-8">
          {(['A', 'B'] as User[]).map(user => {
            const name = user === 'A' ? settings.userA.name : settings.userB.name;
            const count = myTaskCount(user);
            const isA = user === 'A';
            return (
              <button
                key={user}
                onClick={() => onSelectUser(user)}
                className="flex-1 rounded-3xl p-5 flex flex-col items-center gap-4 min-h-[160px] transition-all active:scale-95 border border-white/[0.07]"
                style={{ backgroundColor: '#111119' }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black"
                  style={{
                    background: isA
                      ? 'linear-gradient(135deg, #6366f1, #818cf8)'
                      : 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                  }}
                >
                  {name.charAt(0)}
                </div>
                <div className="text-center">
                  <p className="font-bold text-white text-base">{name}</p>
                  <p className={`text-xs mt-1 font-semibold ${count > 0 ? 'text-primary-400' : 'text-white/25'}`}>
                    {count > 0 ? `${count} 件残り` : '全部完了'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Points */}
        <div className="rounded-2xl border border-white/[0.07] p-5 mb-4" style={{ backgroundColor: '#111119' }}>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] mb-4">今月のポイント</p>
          {(['A', 'B'] as User[]).map(user => {
            const name = user === 'A' ? settings.userA.name : settings.userB.name;
            const pts = user === 'A' ? pA : pB;
            const isA = user === 'A';
            return (
              <div key={user} className="mb-4 last:mb-0">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-sm text-white/60 font-medium">{name}</span>
                  <span className="text-base font-black" style={{ color: isA ? '#818cf8' : '#a78bfa' }}>{pts}<span className="text-xs font-normal text-white/30 ml-0.5">pt</span></span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(pts / maxP) * 100}%`,
                      background: isA
                        ? 'linear-gradient(90deg, #6366f1, #818cf8)'
                        : 'linear-gradient(90deg, #8b5cf6, #a78bfa)',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: '未完了', value: totalTodo, color: '#818cf8' },
            { label: '完了', value: totalDone, color: '#4ade80' },
            { label: '今日期限', value: todayDue, color: '#fb923c' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-2xl border border-white/[0.07] p-4 text-center" style={{ backgroundColor: '#111119' }}>
              <p className="text-2xl font-black" style={{ color }}>{value}</p>
              <p className="text-[10px] text-white/30 mt-1 font-semibold uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

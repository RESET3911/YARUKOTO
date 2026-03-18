import { useState } from 'react';
import { Task, User, Settings } from '../types';
import { POINTS } from '../utils/points';

type Props = { settings: Settings; tasks: Task[] };

export default function StatsScreen({ settings, tasks }: Props) {
  const now = new Date();
  const [yearMonth, setYearMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);

  const changeMonth = (delta: number) => {
    const [y, m] = yearMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setYearMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const monthTasks = tasks.filter(t => t.status === 'done' && t.completedAt?.startsWith(yearMonth));
  const getName = (user: User) => user === 'A' ? settings.userA.name : settings.userB.name;

  const userStats = (['A', 'B'] as User[]).map(user => ({
    user,
    name: getName(user),
    count: monthTasks.filter(t => t.completedBy === user).length,
    points: monthTasks.filter(t => t.completedBy === user).reduce((s, t) => s + POINTS[t.priority], 0),
  }));

  const maxPoints = Math.max(...userStats.map(s => s.points), 1);
  const totalPoints = userStats.reduce((s, u) => s + u.points, 0);

  const categories = monthTasks.reduce((acc, t) => {
    const cat = t.category || 'その他';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const [displayYear, displayMonth] = yearMonth.split('-');

  return (
    <div className="max-w-lg mx-auto px-4 py-5">

      {/* Month selector */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => changeMonth(-1)} className="w-10 h-10 flex items-center justify-center text-white/30 text-xl active:text-white/60 transition-colors">‹</button>
        <div className="text-center">
          <p className="font-black text-white text-xl">{displayYear}<span className="text-white/30 text-sm font-normal">年</span>{displayMonth}<span className="text-white/30 text-sm font-normal">月</span></p>
        </div>
        <button onClick={() => changeMonth(1)} className="w-10 h-10 flex items-center justify-center text-white/30 text-xl active:text-white/60 transition-colors">›</button>
      </div>

      {/* Summary numbers */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="rounded-2xl border border-white/[0.06] p-4 text-center" style={{ backgroundColor: '#111119' }}>
          <p className="text-3xl font-black text-accent-400">{monthTasks.length}</p>
          <p className="text-[10px] text-white/25 mt-1 font-bold uppercase tracking-wider">完了タスク</p>
        </div>
        <div className="rounded-2xl border border-white/[0.06] p-4 text-center" style={{ backgroundColor: '#111119' }}>
          <p className="text-3xl font-black text-primary-400">{totalPoints}</p>
          <p className="text-[10px] text-white/25 mt-1 font-bold uppercase tracking-wider">合計ポイント</p>
        </div>
      </div>

      {/* Points comparison */}
      <div className="rounded-2xl border border-white/[0.06] p-5 mb-4" style={{ backgroundColor: '#111119' }}>
        <p className="text-[10px] font-bold text-white/25 uppercase tracking-[0.15em] mb-5">ポイント比較</p>
        {userStats.map((s, i) => (
          <div key={s.user} className="mb-5 last:mb-0">
            <div className="flex justify-between items-baseline mb-2.5">
              <span className="text-sm text-white/60 font-semibold">{s.name}</span>
              <div className="text-right">
                <span className="text-xl font-black" style={{ color: i === 0 ? '#818cf8' : '#a78bfa' }}>{s.points}</span>
                <span className="text-xs text-white/25 ml-0.5">pt</span>
                <span className="text-xs text-white/25 ml-2">· {s.count}件</span>
              </div>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(s.points / maxPoints) * 100}%`,
                  background: i === 0
                    ? 'linear-gradient(90deg, #6366f1, #818cf8)'
                    : 'linear-gradient(90deg, #8b5cf6, #a78bfa)',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Category breakdown */}
      {Object.keys(categories).length > 0 && (
        <div className="rounded-2xl border border-white/[0.06] p-5" style={{ backgroundColor: '#111119' }}>
          <p className="text-[10px] font-bold text-white/25 uppercase tracking-[0.15em] mb-4">カテゴリ別</p>
          <div className="space-y-3">
            {Object.entries(categories).sort((a, b) => b[1] - a[1]).map(([cat, count]) => {
              const maxCount = Math.max(...Object.values(categories));
              return (
                <div key={cat}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm text-white/60 font-medium">{cat}</span>
                    <span className="text-sm font-bold text-white/50">{count}件</span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(count / maxCount) * 100}%`,
                        backgroundColor: 'rgba(99,102,241,0.5)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {monthTasks.length === 0 && (
        <div className="rounded-2xl border border-white/[0.06] text-center py-16" style={{ backgroundColor: '#111119' }}>
          <p className="text-4xl mb-3 text-white/10">◎</p>
          <p className="text-white/25 text-sm font-medium">この月の完了タスクはありません</p>
        </div>
      )}
    </div>
  );
}

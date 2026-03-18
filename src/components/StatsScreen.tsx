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
    <div className="px-4 py-5">
      {/* Month selector */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => changeMonth(-1)} className="w-10 h-10 flex items-center justify-center text-gray-400 text-2xl active:text-gray-600 bg-white rounded-2xl border border-gray-100 shadow-sm">‹</button>
        <div className="text-center">
          <p className="font-black text-gray-900 text-lg">{displayYear}年{displayMonth}月</p>
        </div>
        <button onClick={() => changeMonth(1)} className="w-10 h-10 flex items-center justify-center text-gray-400 text-2xl active:text-gray-600 bg-white rounded-2xl border border-gray-100 shadow-sm">›</button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-3xl border border-gray-100 p-4 text-center shadow-sm">
          <p className="text-3xl font-black text-green-500">{monthTasks.length}</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">完了タスク</p>
        </div>
        <div className="bg-white rounded-3xl border border-gray-100 p-4 text-center shadow-sm">
          <p className="text-3xl font-black text-primary-500">{totalPoints}</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">合計ポイント</p>
        </div>
      </div>

      {/* Points comparison */}
      <div className="bg-white rounded-3xl border border-gray-100 p-5 mb-3 shadow-sm">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">ポイント比較</p>
        {userStats.map((s, i) => (
          <div key={s.user} className="mb-5 last:mb-0">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-sm font-bold text-gray-700">{s.name}</span>
              <span className={`font-black ${i === 0 ? 'text-primary-500' : 'text-accent-500'}`}>
                {s.points}<span className="text-xs font-normal text-gray-400 ml-0.5">pt</span>
                <span className="text-xs font-normal text-gray-400 ml-1.5">· {s.count}件</span>
              </span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(s.points / maxPoints) * 100}%`,
                  background: i === 0
                    ? 'linear-gradient(90deg, #38bdf8, #0ea5e9)'
                    : 'linear-gradient(90deg, #a78bfa, #8b5cf6)',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Category */}
      {Object.keys(categories).length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">カテゴリ別</p>
          <div className="space-y-3">
            {Object.entries(categories).sort((a, b) => b[1] - a[1]).map(([cat, count]) => {
              const maxCount = Math.max(...Object.values(categories));
              return (
                <div key={cat}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm text-gray-700 font-semibold">{cat}</span>
                    <span className="text-sm font-bold text-accent-500">{count}件</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent-400 to-accent-500"
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {monthTasks.length === 0 && (
        <div className="bg-white rounded-3xl border border-gray-100 text-center py-16 shadow-sm">
          <p className="text-3xl mb-3">📭</p>
          <p className="text-gray-400 font-semibold text-sm">この月の完了タスクはありません</p>
        </div>
      )}
    </div>
  );
}

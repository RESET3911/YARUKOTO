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

  // Category breakdown
  const categories = monthTasks.reduce((acc, t) => {
    const cat = t.category || 'その他';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const [displayYear, displayMonth] = yearMonth.split('-');

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">📊 統計</h2>

      {/* Month selector */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => changeMonth(-1)} className="p-2 min-h-[44px] min-w-[44px] text-gray-500 text-xl">‹</button>
        <p className="font-bold text-gray-900">{displayYear}年{displayMonth}月</p>
        <button onClick={() => changeMonth(1)} className="p-2 min-h-[44px] min-w-[44px] text-gray-500 text-xl">›</button>
      </div>

      {/* Points comparison */}
      <div className="card mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-4">ポイント比較</p>
        {userStats.map(s => (
          <div key={s.user} className="mb-4 last:mb-0">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-700">{s.name}</span>
              <span className="font-bold text-primary-600">{s.points}pt（{s.count}件）</span>
            </div>
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-400 to-accent-400 rounded-full transition-all duration-500"
                style={{ width: `${(s.points / maxPoints) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-500">{monthTasks.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">完了タスク数</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-primary-500">{userStats.reduce((s, u) => s + u.points, 0)}</p>
          <p className="text-xs text-gray-500 mt-0.5">合計ポイント</p>
        </div>
      </div>

      {/* Category breakdown */}
      {Object.keys(categories).length > 0 && (
        <div className="card">
          <p className="text-sm font-semibold text-gray-700 mb-3">カテゴリ別</p>
          <div className="space-y-2">
            {Object.entries(categories).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
              <div key={cat} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{cat}</span>
                <span className="text-sm font-semibold text-purple-600">{count}件</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {monthTasks.length === 0 && (
        <div className="card text-center py-12">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-gray-500">この月の完了タスクはありません</p>
        </div>
      )}
    </div>
  );
}

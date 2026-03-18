import { useState } from 'react';
import { Settings } from '../types';
import Toast from './Toast';

type Props = { settings: Settings; onSave: (s: Settings) => void };

const ICON_OPTIONS = ['✅', '📋', '🏠', '💪', '🌸', '⭐', '🎯', '🔥', '🎀', '🌈'];

export default function SettingsScreen({ settings, onSave }: Props) {
  const [form, setForm] = useState<Settings>(JSON.parse(JSON.stringify(settings)));
  const [toast, setToast] = useState<string | null>(null);

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">⚙️ 設定</h2>
      <div className="space-y-6">
        {/* Notification */}
        <div className="card">
          <h3 className="font-bold text-gray-900 mb-1">🔔 プッシュ通知（ntfy）</h3>
          <p className="text-xs text-gray-500 mb-3">2人で同じトピック名を設定してください（RINGIとは別のトピック）</p>
          <label className="label">トピック名</label>
          <input type="text" value={form.ntfyTopic} onChange={e => setForm(f => ({ ...f, ntfyTopic: e.target.value }))} className="input-field mb-3" placeholder="例: uni-yamada2025" />
          <button
            type="button"
            disabled={!form.ntfyTopic.trim()}
            onClick={async () => {
              try {
                const res = await fetch('https://ntfy.sh', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ topic: form.ntfyTopic.trim(), title: '🔔 uniテスト通知', message: 'テスト通知が届いたら設定完了！', priority: 3 }),
                });
                setToast(res.ok ? '✅ テスト通知を送信しました' : `❌ 失敗: ${res.status}`);
              } catch (e) { setToast(`❌ エラー: ${String(e)}`); }
            }}
            className="btn-secondary w-full text-sm"
          >
            🔔 テスト通知を送る
          </button>
        </div>

        {/* App icon */}
        <div className="card">
          <h3 className="font-bold text-gray-900 mb-3">🎨 アイコン</h3>
          <div className="flex flex-wrap gap-2">
            {ICON_OPTIONS.map(icon => (
              <button key={icon} onClick={() => setForm(f => ({ ...f, appIcon: icon }))}
                className={`text-2xl w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${form.appIcon === icon ? 'bg-primary-100 ring-2 ring-primary-400' : 'bg-gray-100'}`}>
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* Users */}
        <div className="card">
          <h3 className="font-bold text-gray-900 mb-4">👥 ユーザー設定</h3>
          {(['A', 'B'] as const).map(user => {
            const key = user === 'A' ? 'userA' : 'userB';
            return (
              <div key={user} className="mb-3 last:mb-0">
                <label className="label">{user === 'A' ? '🅰️' : '🅱️'} {user}さんの名前</label>
                <input type="text" value={form[key].name}
                  onChange={e => setForm(f => ({ ...f, [key]: { ...f[key], name: e.target.value } }))}
                  className="input-field" placeholder={`${user}さん`} />
              </div>
            );
          })}
        </div>

        <button onClick={() => { onSave(form); setToast('設定を保存しました'); }} className="btn-primary w-full">
          設定を保存する
        </button>
      </div>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

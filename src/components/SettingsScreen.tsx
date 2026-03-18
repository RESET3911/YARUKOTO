import { useState } from 'react';
import { Settings } from '../types';
import Toast from './Toast';

type Props = { settings: Settings; onSave: (s: Settings) => void };

const ICON_OPTIONS = ['✅', '📋', '🏠', '💪', '🌸', '⭐', '🎯', '🔥', '🎀', '🌈'];

export default function SettingsScreen({ settings, onSave }: Props) {
  const [form, setForm] = useState<Settings>(JSON.parse(JSON.stringify(settings)));
  const [toast, setToast] = useState<string | null>(null);

  return (
    <div className="px-4 py-5 space-y-3">

      {/* Notification */}
      <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">プッシュ通知 · ntfy</p>
        <p className="text-xs text-gray-400 mb-4 leading-relaxed">2人で同じトピック名を設定してください（RINGIとは別のトピック名）</p>
        <label className="label">トピック名</label>
        <input
          type="text"
          value={form.ntfyTopic}
          onChange={e => setForm(f => ({ ...f, ntfyTopic: e.target.value }))}
          className="input-field mb-3"
          placeholder="例: uni-yamada2025"
        />
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
          テスト通知を送る
        </button>
      </div>

      {/* App icon */}
      <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">アイコン</p>
        <div className="flex flex-wrap gap-2">
          {ICON_OPTIONS.map(icon => (
            <button
              key={icon}
              onClick={() => setForm(f => ({ ...f, appIcon: icon }))}
              className={`text-2xl w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-95 ${
                form.appIcon === icon
                  ? 'bg-primary-100 ring-2 ring-primary-400'
                  : 'bg-gray-50 border border-gray-100'
              }`}
            >
              {icon}
            </button>
          ))}
          <input
            type="text"
            value={ICON_OPTIONS.includes(form.appIcon) ? '' : form.appIcon}
            onChange={e => {
              const val = [...e.target.value].find(() => true) ?? '✅';
              setForm(f => ({ ...f, appIcon: val }));
            }}
            placeholder="✏️"
            className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 text-center text-xl outline-none focus:ring-2 focus:ring-primary-400"
            maxLength={2}
          />
        </div>
      </div>

      {/* Users */}
      <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">ユーザー設定</p>
        {(['A', 'B'] as const).map(user => {
          const key = user === 'A' ? 'userA' : 'userB';
          return (
            <div key={user} className="mb-4 last:mb-0">
              <label className="label">{user === 'A' ? '🅰️' : '🅱️'} {user}さんの名前</label>
              <input
                type="text"
                value={form[key].name}
                onChange={e => setForm(f => ({ ...f, [key]: { ...f[key], name: e.target.value } }))}
                className="input-field"
                placeholder={`${user}さん`}
              />
            </div>
          );
        })}
      </div>

      <button
        onClick={() => { onSave(form); setToast('設定を保存しました'); }}
        className="btn-primary w-full"
      >
        設定を保存する
      </button>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

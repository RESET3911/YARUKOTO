import { useState } from 'react';
import { Settings } from '../types';
import Toast from './Toast';

type Props = { settings: Settings; onSave: (s: Settings) => void };

const ICON_OPTIONS = ['✅', '📋', '🏠', '💪', '🌸', '⭐', '🎯', '🔥', '🎀', '🌈'];

export default function SettingsScreen({ settings, onSave }: Props) {
  const [form, setForm] = useState<Settings>(JSON.parse(JSON.stringify(settings)));
  const [toast, setToast] = useState<string | null>(null);

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="rounded-2xl border border-white/[0.06] p-5" style={{ backgroundColor: '#111119' }}>
      <p className="text-[10px] font-bold text-white/25 uppercase tracking-[0.15em] mb-4">{title}</p>
      {children}
    </div>
  );

  return (
    <div className="max-w-lg mx-auto px-4 py-5">
      <div className="space-y-3">

        <Section title="プッシュ通知 · ntfy">
          <p className="text-xs text-white/30 mb-4 leading-relaxed">
            2人で同じトピック名を設定してください（RINGIとは別のトピック名）
          </p>
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
        </Section>

        <Section title="アイコン">
          <div className="flex flex-wrap gap-2">
            {ICON_OPTIONS.map(icon => (
              <button
                key={icon}
                onClick={() => setForm(f => ({ ...f, appIcon: icon }))}
                className={`text-2xl w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  form.appIcon === icon
                    ? 'ring-2 ring-primary-400'
                    : 'active:scale-95'
                }`}
                style={{ backgroundColor: form.appIcon === icon ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)' }}
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
              className="w-12 h-12 rounded-xl text-center text-xl border-none outline-none focus:ring-2 focus:ring-primary-400"
              style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
              maxLength={2}
            />
          </div>
        </Section>

        <Section title="ユーザー設定">
          {(['A', 'B'] as const).map(user => {
            const key = user === 'A' ? 'userA' : 'userB';
            return (
              <div key={user} className="mb-4 last:mb-0">
                <label className="label">{user}さんの名前</label>
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
        </Section>

        <button
          onClick={() => { onSave(form); setToast('設定を保存しました'); }}
          className="btn-primary w-full"
        >
          設定を保存する
        </button>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

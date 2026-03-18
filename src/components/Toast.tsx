import { useEffect } from 'react';
type Props = { message: string; type?: 'success' | 'error' | 'info'; onClose: () => void };
export default function Toast({ message, type = 'success', onClose }: Props) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  const style = {
    success: { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.25)', text: '#4ade80' },
    error:   { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)', text: '#f87171' },
    info:    { bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.25)', text: '#818cf8' },
  }[type];
  return (
    <div
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-semibold max-w-xs text-center border backdrop-blur-md whitespace-nowrap"
      style={{ backgroundColor: style.bg, borderColor: style.border, color: style.text }}
    >
      {message}
    </div>
  );
}

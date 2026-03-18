import { useEffect } from 'react';
type Props = { message: string; type?: 'success' | 'error' | 'info'; onClose: () => void };
export default function Toast({ message, type = 'success', onClose }: Props) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-primary-500',
  };
  return (
    <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 ${colors[type]} text-white px-5 py-3 rounded-2xl shadow-lg text-sm font-bold max-w-xs text-center whitespace-nowrap`}>
      {message}
    </div>
  );
}

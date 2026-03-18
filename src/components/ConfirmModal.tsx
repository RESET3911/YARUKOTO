type Props = {
  title: string; message: string; confirmLabel?: string; cancelLabel?: string;
  isDanger?: boolean; onConfirm: () => void; onCancel: () => void;
};
export default function ConfirmModal({ title, message, confirmLabel = '確認', cancelLabel = 'キャンセル', isDanger = false, onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-3xl border border-white/[0.08] p-6" style={{ backgroundColor: '#1a1a2a' }}>
        <h3 className="text-lg font-black text-white mb-2">{title}</h3>
        <p className="text-white/50 text-sm mb-5 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 btn-secondary">{cancelLabel}</button>
          <button onClick={onConfirm} className={`flex-1 ${isDanger ? 'btn-danger' : 'btn-primary'}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

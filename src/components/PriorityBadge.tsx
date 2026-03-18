import { Priority } from '../types';

const config: Record<Priority, { label: string; color: string; dot: string }> = {
  urgent: { label: '緊急', color: 'text-rose-400',   dot: 'bg-rose-400' },
  high:   { label: '高',   color: 'text-orange-400', dot: 'bg-orange-400' },
  medium: { label: '中',   color: 'text-blue-400',   dot: 'bg-blue-400' },
  low:    { label: '低',   color: 'text-white/30',   dot: 'bg-white/20' },
};

export default function PriorityBadge({ priority }: { priority: Priority }) {
  const { label, color, dot } = config[priority];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

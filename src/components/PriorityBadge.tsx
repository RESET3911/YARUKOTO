import { Priority } from '../types';

const config: Record<Priority, { label: string; bg: string; text: string }> = {
  urgent: { label: '緊急', bg: 'bg-red-100',    text: 'text-red-600' },
  high:   { label: '高',   bg: 'bg-orange-100', text: 'text-orange-600' },
  medium: { label: '中',   bg: 'bg-blue-100',   text: 'text-blue-600' },
  low:    { label: '低',   bg: 'bg-gray-100',   text: 'text-gray-500' },
};

export default function PriorityBadge({ priority }: { priority: Priority }) {
  const { label, bg, text } = config[priority];
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${bg} ${text}`}>
      {label}
    </span>
  );
}

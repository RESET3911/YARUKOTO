import { Priority } from '../types';
const config: Record<Priority, { label: string; color: string }> = {
  low:    { label: '低',   color: 'bg-gray-100 text-gray-600' },
  medium: { label: '中',   color: 'bg-blue-100 text-blue-700' },
  high:   { label: '高',   color: 'bg-orange-100 text-orange-700' },
  urgent: { label: '緊急', color: 'bg-red-100 text-red-700' },
};
export default function PriorityBadge({ priority }: { priority: Priority }) {
  const { label, color } = config[priority];
  return <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${color}`}>{label}</span>;
}

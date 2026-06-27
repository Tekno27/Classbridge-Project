import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: string;
  color: 'green' | 'blue' | 'amber' | 'rose' | 'sky' | 'purple';
}

const colorMap = {
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  blue: 'bg-sky-50 text-sky-700 border-sky-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  rose: 'bg-rose-50 text-rose-700 border-rose-200',
  sky: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  purple: 'bg-violet-50 text-violet-700 border-violet-200',
};

const iconBgMap = {
  green: 'bg-emerald-100',
  blue: 'bg-sky-100',
  amber: 'bg-amber-100',
  rose: 'bg-rose-100',
  sky: 'bg-cyan-100',
  purple: 'bg-violet-100',
};

export default function StatCard({ title, value, icon: Icon, trend, color }: StatCardProps) {
  return (
    <div className={`rounded-xl border p-4 sm:p-5 ${colorMap[color]}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold">{value}</p>
          {trend && (
            <p className="text-xs opacity-70">{trend}</p>
          )}
        </div>
        <div className={`p-2.5 rounded-lg ${iconBgMap[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

import type { LucideIcon } from 'lucide-react';

interface QuickAction {
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  onClick: () => void;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export default function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            onClick={action.onClick}
            className="flex items-center gap-3 p-4 rounded-xl border bg-white hover:shadow-md hover:border-emerald-200 transition-all text-left group"
          >
            <div className={`p-2.5 rounded-lg ${action.color} group-hover:scale-105 transition-transform`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">{action.label}</p>
              <p className="text-xs text-muted-foreground">{action.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

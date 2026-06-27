import { Bell, Menu, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useApp } from '@/contexts/AppContext';

interface TopBarProps {
  title: string;
  onMenuClick?: () => void;
}

export default function TopBar({ title, onMenuClick }: TopBarProps) {
  const { state } = useApp();
  const user = state.currentUser;
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-border px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-foreground truncate">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/notifications')}
            className="relative p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full" />
          </button>
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2 pl-2 border-l border-border rounded-lg hover:bg-muted transition-colors"
          >
            <UserCircle className="h-8 w-8 text-emerald-600" />
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium leading-tight">{user?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}

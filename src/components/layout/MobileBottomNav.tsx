import { useLocation, useNavigate } from 'react-router';
import {
  LayoutDashboard, BookOpen, FileText, ClipboardList, PlusCircle, CheckSquare, Users
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import type { UserRole } from '@/types';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: Record<UserRole, NavItem[]> = {
  teacher: [
    { label: 'Home', path: '/teacher', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'Classes', path: '/teacher/classes', icon: <BookOpen className="h-5 w-5" /> },
    { label: 'Lessons', path: '/teacher/lessons', icon: <FileText className="h-5 w-5" /> },
    { label: 'Tasks', path: '/teacher/assignments', icon: <ClipboardList className="h-5 w-5" /> },
  ],
  headteacher: [
    { label: 'Home', path: '/headteacher', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'Review', path: '/headteacher/review', icon: <CheckSquare className="h-5 w-5" /> },
    { label: 'Classes', path: '/headteacher/classes', icon: <BookOpen className="h-5 w-5" /> },
    { label: 'Staff', path: '/headteacher/teachers', icon: <Users className="h-5 w-5" /> },
  ],
  student: [
    { label: 'Home', path: '/student', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'Classes', path: '/student/classes', icon: <BookOpen className="h-5 w-5" /> },
    { label: 'Lessons', path: '/student/lessons', icon: <FileText className="h-5 w-5" /> },
    { label: 'Join', path: '/student/join', icon: <PlusCircle className="h-5 w-5" /> },
  ],
};

export default function MobileBottomNav() {
  const { state } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const user = state.currentUser;

  if (!user) return null;

  const items = navItems[user.role];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 pb-safe">
      <div className="flex items-center justify-around py-1">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
                isActive ? 'text-emerald-700' : 'text-muted-foreground'
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

import { useLocation, useNavigate } from 'react-router';
import {
  LayoutDashboard, BookOpen, FileText, ClipboardList,
  GraduationCap, Settings, LogOut, Users, CheckSquare, PlusCircle
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
    { label: 'Dashboard', path: '/teacher', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'My Classes', path: '/teacher/classes', icon: <BookOpen className="h-5 w-5" /> },
    { label: 'Lesson Notes', path: '/teacher/lessons', icon: <FileText className="h-5 w-5" /> },
    { label: 'Assignments', path: '/teacher/assignments', icon: <ClipboardList className="h-5 w-5" /> },
    { label: 'Submissions', path: '/teacher/submissions', icon: <CheckSquare className="h-5 w-5" /> },
  ],
  headteacher: [
    { label: 'Dashboard', path: '/headteacher', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'Review Lessons', path: '/headteacher/review', icon: <CheckSquare className="h-5 w-5" /> },
    { label: 'All Classes', path: '/headteacher/classes', icon: <BookOpen className="h-5 w-5" /> },
    { label: 'Teachers', path: '/headteacher/teachers', icon: <Users className="h-5 w-5" /> },
  ],
  student: [
    { label: 'Dashboard', path: '/student', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'My Classes', path: '/student/classes', icon: <BookOpen className="h-5 w-5" /> },
    { label: 'Lessons', path: '/student/lessons', icon: <FileText className="h-5 w-5" /> },
    { label: 'Assignments', path: '/student/assignments', icon: <ClipboardList className="h-5 w-5" /> },
    { label: 'Join Class', path: '/student/join', icon: <PlusCircle className="h-5 w-5" /> },
  ],
};

export default function DesktopSidebar() {
  const { state, dispatch } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const user = state.currentUser;

  if (!user) return null;

  const items = navItems[user.role];

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/');
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-border h-screen sticky top-0">
      <div className="p-4 border-b border-border">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-emerald-700 hover:text-emerald-800 transition-colors"
        >
          <GraduationCap className="h-7 w-7" />
          <span className="text-lg font-bold">ClassBridge</span>
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <Settings className="h-5 w-5" />
          Settings
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}

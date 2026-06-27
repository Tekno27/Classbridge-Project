import { useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import DesktopSidebar from './DesktopSidebar';
import MobileBottomNav from './MobileBottomNav';
import TopBar from './TopBar';

function getPageTitle(pathname: string): string {
  if (pathname === '/teacher') return 'Teacher Dashboard';
  if (pathname === '/teacher/classes') return 'My Classes';
  if (pathname === '/teacher/lessons') return 'Lesson Notes';
  if (pathname === '/teacher/assignments') return 'Assignments';
  if (pathname === '/teacher/submissions') return 'Student Submissions';
  if (pathname === '/teacher/class/new') return 'Create New Class';
  if (pathname === '/teacher/lesson/new') return 'Create Lesson Note';
  if (pathname === '/headteacher') return 'Headteacher Dashboard';
  if (pathname === '/headteacher/review') return 'Review Lesson Notes';
  if (pathname === '/headteacher/classes') return 'All Classes';
  if (pathname === '/headteacher/teachers') return 'Teachers';
  if (pathname === '/headteacher/users') return 'Manage Users';
  if (pathname === '/headteacher/assign-class') return 'Assign Class';
  if (pathname === '/student') return 'Student Dashboard';
  if (pathname === '/student/classes') return 'My Classes';
  if (pathname === '/student/lessons') return 'Available Lessons';
  if (pathname === '/student/assignments') return 'My Assignments';
  if (pathname === '/student/join') return 'Join a Class';
  return 'ClassBridge';
}

export default function DashboardLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-muted/30">
      <DesktopSidebar />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <DesktopSidebar />
      </div>

      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        <TopBar
          title={getPageTitle(location.pathname)}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 pb-24 lg:pb-6 overflow-y-auto">
          <Outlet />
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}

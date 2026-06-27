import { GraduationCap } from 'lucide-react';
import { Outlet, Link } from 'react-router';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 flex flex-col">
      <header className="px-4 py-4">
        <Link to="/" className="flex items-center gap-2 text-emerald-700">
          <GraduationCap className="h-7 w-7" />
          <span className="text-lg font-bold">ClassBridge Ghana</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <Outlet />
      </main>
      <footer className="text-center py-4 text-sm text-muted-foreground">
        ClassBridge Ghana - Bridging Classrooms Through Better Workflows
      </footer>
    </div>
  );
}

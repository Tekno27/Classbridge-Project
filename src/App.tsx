import { Routes, Route, Navigate } from 'react-router';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { Toaster } from '@/components/ui/sonner';
import AuthLayout from '@/components/layout/AuthLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import TeacherDashboard from '@/pages/TeacherDashboard';
import StudentDashboard from '@/pages/StudentDashboard';
import HeadteacherDashboard from '@/pages/HeadteacherDashboard';
import CreateClassPage from '@/pages/CreateClassPage';
import LessonCreatorPage from '@/pages/LessonCreatorPage';
import LessonReviewPage from '@/pages/LessonReviewPage';
import ClassesPage from '@/pages/ClassesPage';
import TeacherLessonsPage from '@/pages/TeacherLessonsPage';
import AssignmentsPage from '@/pages/AssignmentsPage';
import StudentAssignmentsPage from '@/pages/StudentAssignmentsPage';
import SubmissionsPage from '@/pages/SubmissionsPage';
import HeadteacherClassesPage from '@/pages/HeadteacherClassesPage';
import HeadteacherTeachersPage from '@/pages/HeadteacherTeachersPage';
import LessonsPage from '@/pages/LessonsPage';
import JoinClassPage from '@/pages/JoinClassPage';
import DiscussionPage from '@/pages/DiscussionPage';
import NotificationsPage from '@/pages/NotificationsPage';
import SettingsPage from '@/pages/SettingsPage';

function RequireAuth({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { state } = useApp();

  if (!state.isAuthenticated || !state.currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(state.currentUser.role)) {
    const roleRoutes: Record<string, string> = {
      teacher: '/teacher',
      student: '/student',
      headteacher: '/headteacher',
    };
    return <Navigate to={roleRoutes[state.currentUser.role] || '/'} replace />;
  }

  return <>{children}</>;
}

function RedirectAuthenticated() {
  const { state } = useApp();

  if (state.isAuthenticated && state.currentUser) {
    const roleRoutes: Record<string, string> = {
      teacher: '/teacher',
      student: '/student',
      headteacher: '/headteacher',
    };
    return <Navigate to={roleRoutes[state.currentUser.role] || '/'} replace />;
  }

  return <LoginPage />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<RedirectAuthenticated />} />
      </Route>

      {/* Teacher Routes */}
      <Route element={<DashboardLayout />}>
        <Route
          path="/teacher"
          element={
            <RequireAuth allowedRoles={['teacher']}>
              <TeacherDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/teacher/classes"
          element={
            <RequireAuth allowedRoles={['teacher']}>
              <ClassesPage />
            </RequireAuth>
          }
        />
        <Route
          path="/teacher/class/new"
          element={
            <RequireAuth allowedRoles={['teacher']}>
              <CreateClassPage />
            </RequireAuth>
          }
        />
        <Route
          path="/teacher/lessons"
          element={
            <RequireAuth allowedRoles={['teacher']}>
              <TeacherLessonsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/teacher/lesson/new"
          element={
            <RequireAuth allowedRoles={['teacher']}>
              <LessonCreatorPage />
            </RequireAuth>
          }
        />
        <Route
          path="/teacher/assignments"
          element={
            <RequireAuth allowedRoles={['teacher']}>
              <AssignmentsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/teacher/submissions"
          element={
            <RequireAuth allowedRoles={['teacher']}>
              <SubmissionsPage />
            </RequireAuth>
          }
        />
      </Route>

      {/* Headteacher Routes */}
      <Route element={<DashboardLayout />}>
        <Route
          path="/headteacher"
          element={
            <RequireAuth allowedRoles={['headteacher']}>
              <HeadteacherDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/headteacher/review"
          element={
            <RequireAuth allowedRoles={['headteacher']}>
              <LessonReviewPage />
            </RequireAuth>
          }
        />
        <Route
          path="/headteacher/classes"
          element={
            <RequireAuth allowedRoles={['headteacher']}>
              <HeadteacherClassesPage />
            </RequireAuth>
          }
        />
        <Route
          path="/headteacher/teachers"
          element={
            <RequireAuth allowedRoles={['headteacher']}>
              <HeadteacherTeachersPage />
            </RequireAuth>
          }
        />
      </Route>

      {/* Student Routes */}
      <Route element={<DashboardLayout />}>
        <Route
          path="/student"
          element={
            <RequireAuth allowedRoles={['student']}>
              <StudentDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/student/classes"
          element={
            <RequireAuth allowedRoles={['student']}>
              <ClassesPage />
            </RequireAuth>
          }
        />
        <Route
          path="/student/lessons"
          element={
            <RequireAuth allowedRoles={['student']}>
              <LessonsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/student/assignments"
          element={
            <RequireAuth allowedRoles={['student']}>
              <StudentAssignmentsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/student/join"
          element={
            <RequireAuth allowedRoles={['student']}>
              <JoinClassPage />
            </RequireAuth>
          }
        />
      </Route>

      {/* Shared routes */}
      <Route element={<DashboardLayout />}>
        <Route
          path="/discussion/:lessonId"
          element={
            <RequireAuth>
              <DiscussionPage />
            </RequireAuth>
          }
        />
        <Route
          path="/notifications"
          element={
            <RequireAuth>
              <NotificationsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireAuth>
              <SettingsPage />
            </RequireAuth>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
      <Toaster position="top-right" richColors />
    </AppProvider>
  );
}

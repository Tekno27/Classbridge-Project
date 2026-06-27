import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  BookOpen, FileText, ClipboardList, CheckSquare, Clock, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatCard from '@/components/dashboard/StatCard';
import ActivityTimeline from '@/components/dashboard/ActivityTimeline';
import QuickActions from '@/components/dashboard/QuickActions';
import { statsApi, activitiesApi, lessonsApi, assignmentsApi, submissionsApi } from '@/services/api';
import { useApp } from '@/contexts/AppContext';
import type { LessonNote, Submission } from '@/types';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [stats, setStats] = useState({ totalClasses: 0, pendingLessons: 0, approvedLessons: 0, totalAssignments: 0, totalSubmissions: 0 });
  const [recentLessons, setRecentLessons] = useState<LessonNote[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!state.currentUser) return;
      const [s, lessons, acts, , subs] = await Promise.all([
        statsApi.getTeacherStats(state.currentUser.id),
        lessonsApi.getByTeacher(state.currentUser.id),
        activitiesApi.getAll(),
        assignmentsApi.getByTeacher(state.currentUser.id),
        submissionsApi.getByTeacher(state.currentUser.id),
      ]);
      setStats(s);
      setRecentLessons(lessons.slice(0, 3));
      dispatch({ type: 'SET_ACTIVITIES', payload: acts });
      setRecentSubmissions(subs.filter((s) => s.status === 'submitted').slice(0, 3));
    };
    loadData();
  }, [state.currentUser, dispatch]);

  const quickActions = [
    {
      label: 'Create Class',
      description: 'Set up a new class',
      icon: BookOpen,
      color: 'bg-emerald-100 text-emerald-700',
      onClick: () => navigate('/teacher/class/new'),
    },
    {
      label: 'Lesson Note',
      description: 'Plan a new lesson',
      icon: FileText,
      color: 'bg-sky-100 text-sky-700',
      onClick: () => navigate('/teacher/lesson/new'),
    },
    {
      label: 'Assignment',
      description: 'Create new task',
      icon: ClipboardList,
      color: 'bg-amber-100 text-amber-700',
      onClick: () => navigate('/teacher/assignments'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard title="Classes" value={stats.totalClasses} icon={BookOpen} color="green" />
        <StatCard title="Pending" value={stats.pendingLessons} icon={Clock} color="amber" />
        <StatCard title="Approved" value={stats.approvedLessons} icon={CheckSquare} color="green" />
        <StatCard title="Assignments" value={stats.totalAssignments} icon={ClipboardList} color="blue" />
        <StatCard title="Submissions" value={stats.totalSubmissions} icon={FileText} color="sky" />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <QuickActions actions={quickActions} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Lessons */}
        <div className="bg-white rounded-xl border p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent Lesson Notes</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/teacher/lessons')}>
              View All <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
          {recentLessons.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No lesson notes yet. Create your first one!
            </div>
          ) : (
            <div className="space-y-3">
              {recentLessons.map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => navigate('/teacher/lessons')}
                  className="w-full text-left p-3 rounded-lg border hover:border-emerald-200 hover:bg-emerald-50/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{lesson.topic}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      lesson.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                      lesson.status === 'submitted' ? 'bg-amber-100 text-amber-700' :
                      lesson.status === 'correction_requested' ? 'bg-rose-100 text-rose-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {lesson.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{lesson.className} - Week {lesson.week}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Activity Timeline */}
        <div className="bg-white rounded-xl border p-4 sm:p-5">
          <h2 className="font-semibold mb-4">Recent Activity</h2>
          <ActivityTimeline activities={state.activities} limit={6} />
        </div>
      </div>

      {/* Submissions Needing Grading */}
      {recentSubmissions.length > 0 && (
        <div className="bg-white rounded-xl border p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              Submissions to Grade
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/teacher/submissions')}>
              View All <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
          <div className="space-y-3">
            {recentSubmissions.map((sub) => (
              <button
                key={sub.id}
                onClick={() => navigate('/teacher/submissions')}
                className="w-full text-left p-3 rounded-lg border hover:border-emerald-200 hover:bg-emerald-50/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{sub.studentName}</span>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Pending Grade</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{sub.assignmentTitle}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

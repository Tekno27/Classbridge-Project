import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  BookOpen, Users, XCircle, ArrowRight, Clock, CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatCard from '@/components/dashboard/StatCard';
import ActivityTimeline from '@/components/dashboard/ActivityTimeline';
import { statsApi, activitiesApi, lessonsApi } from '@/services/api';
import { useApp } from '@/contexts/AppContext';
import type { LessonNote } from '@/types';

export default function HeadteacherDashboard() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [stats, setStats] = useState({ pendingReviews: 0, approvedLessons: 0, correctionsRequested: 0, totalClasses: 0, totalTeachers: 0, totalStudents: 0 });
  const [pendingLessons, setPendingLessons] = useState<LessonNote[]>([]);
  const [recentApproved, setRecentApproved] = useState<LessonNote[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [s, pending, approved, acts] = await Promise.all([
        statsApi.getHeadteacherStats(),
        lessonsApi.getPendingReview(),
        lessonsApi.getByStatus('approved'),
        activitiesApi.getAll(),
      ]);
      setStats(s);
      setPendingLessons(pending);
      setRecentApproved(approved.slice(0, 5));
      dispatch({ type: 'SET_ACTIVITIES', payload: acts });
    };
    loadData();
  }, [dispatch]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <StatCard title="Pending Review" value={stats.pendingReviews} icon={Clock} color="amber" trend="Needs your attention" onClick={() => navigate('/headteacher/review')} />
        <StatCard title="Approved" value={stats.approvedLessons} icon={CheckCircle} color="green" onClick={() => navigate('/headteacher/review')} />
        <StatCard title="Corrections" value={stats.correctionsRequested} icon={XCircle} color="rose" onClick={() => navigate('/headteacher/review')} />
        <StatCard title="Total Classes" value={stats.totalClasses} icon={BookOpen} color="blue" onClick={() => navigate('/headteacher/classes')} />
        <StatCard title="Teachers" value={stats.totalTeachers} icon={Users} color="purple" onClick={() => navigate('/headteacher/teachers')} />
        <StatCard title="Students" value={stats.totalStudents} icon={Users} color="sky" onClick={() => navigate('/headteacher/classes')} />
      </div>

      {/* Pending Reviews - Priority */}
      <div className="bg-white rounded-xl border p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            Lesson Notes Awaiting Review
          </h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/headteacher/review')}>
            Review All <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
        {pendingLessons.length === 0 ? (
          <div className="text-center py-8 text-emerald-700 bg-emerald-50 rounded-lg">
            <CheckCircle className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">All caught up!</p>
            <p className="text-sm">No lesson notes pending review.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingLessons.map((lesson) => (
              <button
                key={lesson.id}
                onClick={() => navigate('/headteacher/review')}
                className="w-full text-left p-4 rounded-lg border hover:border-amber-300 hover:bg-amber-50/30 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{lesson.topic}</span>
                      <span className="status-badge status-badge-submitted text-xs">Pending</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{lesson.subTopic}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{lesson.teacherName}</span>
                      <span>{lesson.className}</span>
                      <span>Week {lesson.week}</span>
                      <span>{lesson.duration} mins</span>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recently Approved */}
        <div className="bg-white rounded-xl border p-4 sm:p-5">
          <h2 className="font-semibold mb-4">Recently Approved</h2>
          {recentApproved.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">No approved lessons yet.</div>
          ) : (
            <div className="space-y-3">
              {recentApproved.map((lesson) => (
                <div key={lesson.id} className="p-3 rounded-lg border bg-emerald-50/30">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{lesson.topic}</span>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Approved</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{lesson.teacherName} | {lesson.className}</p>
                  {lesson.headteacherComment && (
                    <p className="text-xs text-emerald-700 mt-1 italic">&quot;{lesson.headteacherComment}&quot;</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity */}
        <div className="bg-white rounded-xl border p-4 sm:p-5">
          <h2 className="font-semibold mb-4">Recent Activity</h2>
          <ActivityTimeline activities={state.activities} limit={6} />
        </div>
      </div>
    </div>
  );
}

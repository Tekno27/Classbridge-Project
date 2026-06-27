import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  BookOpen, FileText, ClipboardList, Star, ArrowRight, PlusCircle, MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatCard from '@/components/dashboard/StatCard';
import { statsApi, classesApi, lessonsApi, assignmentsApi, submissionsApi } from '@/services/api';
import { useApp } from '@/contexts/AppContext';
import type { Class, LessonNote, Assignment, Submission } from '@/types';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { state } = useApp();
  const [stats, setStats] = useState({ joinedClasses: 0, availableLessons: 0, pendingAssignments: 0, submittedWork: 0, feedbackReceived: 0 });
  const [classes, setClasses] = useState<Class[]>([]);
  const [lessons, setLessons] = useState<LessonNote[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!state.currentUser) return;
      const [s, cls, subs] = await Promise.all([
        statsApi.getStudentStats(state.currentUser.id),
        classesApi.getByStudent(state.currentUser.id),
        submissionsApi.getByStudent(state.currentUser.id),
      ]);
      setStats(s);
      setClasses(cls);
      setSubmissions(subs);

      // Get lessons and assignments for joined classes
      const allLessons: LessonNote[] = [];
      const allAssignments: Assignment[] = [];
      for (const c of cls) {
        const [ls, as] = await Promise.all([
          lessonsApi.getByClass(c.id),
          assignmentsApi.getByClass(c.id),
        ]);
        allLessons.push(...ls);
        allAssignments.push(...as);
      }
      setLessons(allLessons);
      // assignments used for stats only
    };
    loadData();
  }, [state.currentUser]);

  const gradedSubmissions = submissions.filter((s) => s.status === 'graded');

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard title="Classes" value={stats.joinedClasses} icon={BookOpen} color="green" />
        <StatCard title="Lessons" value={stats.availableLessons} icon={FileText} color="blue" />
        <StatCard title="Pending" value={stats.pendingAssignments} icon={ClipboardList} color="amber" />
        <StatCard title="Submitted" value={stats.submittedWork} icon={FileText} color="sky" />
        <StatCard title="Feedback" value={stats.feedbackReceived} icon={Star} color="purple" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/student/join')}
          className="flex items-center gap-3 p-4 rounded-xl border bg-white hover:shadow-md hover:border-emerald-200 transition-all text-left"
        >
          <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg">
            <PlusCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-sm">Join Class</p>
            <p className="text-xs text-muted-foreground">Enter a class code</p>
          </div>
        </button>
        <button
          onClick={() => navigate('/student/assignments')}
          className="flex items-center gap-3 p-4 rounded-xl border bg-white hover:shadow-md hover:border-emerald-200 transition-all text-left"
        >
          <div className="p-2.5 bg-sky-100 text-sky-700 rounded-lg">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-sm">My Assignments</p>
            <p className="text-xs text-muted-foreground">View and submit work</p>
          </div>
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* My Classes */}
        <div className="bg-white rounded-xl border p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">My Classes</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/student/classes')}>
              View All <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
          {classes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-3">You haven&apos;t joined any classes yet.</p>
              <Button size="sm" onClick={() => navigate('/student/join')}>
                <PlusCircle className="h-4 w-4 mr-1" /> Join Class
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {classes.map((c) => (
                <div key={c.id} className="p-3 rounded-lg border bg-muted/30">
                  <p className="font-medium text-sm">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.teacherName} | {c.term}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Lessons */}
        <div className="bg-white rounded-xl border p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Available Lessons</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/student/lessons')}>
              View All <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
          {lessons.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No approved lessons yet. Check back soon!
            </div>
          ) : (
            <div className="space-y-3">
              {lessons.slice(0, 4).map((lesson) => (
                <div key={lesson.id} className="p-3 rounded-lg border hover:border-emerald-200 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{lesson.topic}</span>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Approved</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{lesson.className} - Week {lesson.week}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-7 text-xs"
                    onClick={() => navigate(`/discussion/${lesson.id}`)}
                  >
                    <MessageCircle className="h-3 w-3 mr-1" /> Discussion
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Grades */}
      {gradedSubmissions.length > 0 && (
        <div className="bg-white rounded-xl border p-4 sm:p-5">
          <h2 className="font-semibold mb-4">Recent Grades</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {gradedSubmissions.map((sub) => (
              <div key={sub.id} className="p-3 rounded-lg border bg-emerald-50/50">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{sub.assignmentTitle}</span>
                  <span className="text-lg font-bold text-emerald-700">{sub.score} pts</span>
                </div>
                {sub.feedback && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{sub.feedback}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft, FileText, PlusCircle, Clock, CheckCircle, XCircle, Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { lessonsApi } from '@/services/api';
import { useApp } from '@/contexts/AppContext';
import type { LessonNote } from '@/types';

export default function TeacherLessonsPage() {
  const navigate = useNavigate();
  const { state } = useApp();
  const [lessons, setLessons] = useState<LessonNote[]>([]);
  const [filter, setFilter] = useState<'all' | 'draft' | 'submitted' | 'approved' | 'correction_requested'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!state.currentUser) return;
    const ls = await lessonsApi.getByTeacher(state.currentUser.id);
    setLessons(ls);
  };

  const filteredLessons = filter === 'all' ? lessons : lessons.filter((l) => l.status === filter);

  const statusConfig = {
    draft: { icon: Clock, label: 'Draft', className: 'status-badge-draft' },
    submitted: { icon: Send, label: 'Pending Review', className: 'status-badge-submitted' },
    approved: { icon: CheckCircle, label: 'Approved', className: 'status-badge-approved' },
    correction_requested: { icon: XCircle, label: 'Correction Needed', className: 'status-badge-correction' },
  };

  const filters: Array<{ key: typeof filter; label: string; count: number }> = [
    { key: 'all', label: 'All', count: lessons.length },
    { key: 'draft', label: 'Drafts', count: lessons.filter((l) => l.status === 'draft').length },
    { key: 'submitted', label: 'Pending', count: lessons.filter((l) => l.status === 'submitted').length },
    { key: 'approved', label: 'Approved', count: lessons.filter((l) => l.status === 'approved').length },
    { key: 'correction_requested', label: 'Corrections', count: lessons.filter((l) => l.status === 'correction_requested').length },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/teacher')}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Lesson Notes</h1>
            <p className="text-sm text-muted-foreground">Manage your lesson plans</p>
          </div>
        </div>
        <Button className="bg-emerald-700 hover:bg-emerald-800 text-white" onClick={() => navigate('/teacher/lesson/new')}>
          <PlusCircle className="h-4 w-4 mr-1" /> Create
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-sm border whitespace-nowrap transition-colors ${
              filter === f.key ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'hover:bg-muted'
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {filteredLessons.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">No lesson notes found</p>
          <p className="text-sm text-muted-foreground">Create your first lesson note to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLessons.map((lesson) => {
            const status = statusConfig[lesson.status];
            const StatusIcon = status.icon;
            return (
              <div key={lesson.id} className="bg-white rounded-xl border p-4 sm:p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{lesson.topic}</h3>
                    <p className="text-sm text-muted-foreground">{lesson.subTopic}</p>
                  </div>
                  <span className={`status-badge ${status.className} flex items-center gap-1`}>
                    <StatusIcon className="h-3 w-3" />
                    {status.label}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mb-3">
                  <span>{lesson.className}</span>
                  <span>Week {lesson.week}</span>
                  <span>{lesson.duration} mins</span>
                  <span>{lesson.date}</span>
                </div>

                <div className="bg-muted/40 rounded-lg p-2.5 text-sm line-clamp-2 mb-3">
                  {lesson.learningObjectives}
                </div>

                {lesson.headteacherComment && lesson.status !== 'draft' && (
                  <div className={`rounded-lg p-2.5 text-xs mb-3 ${
                    lesson.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    <strong>{lesson.status === 'approved' ? 'Approval' : 'Correction'}:</strong>{' '}
                    {lesson.headteacherComment}
                  </div>
                )}

                <div className="flex gap-2">
                  {lesson.status === 'draft' && (
                    <Button size="sm" variant="outline" onClick={() => navigate('/teacher/lesson/new')}>
                      Edit Draft
                    </Button>
                  )}
                  {lesson.status === 'approved' && (
                    <Button size="sm" variant="outline" onClick={() => navigate(`/discussion/${lesson.id}`)}>
                      View Discussion
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

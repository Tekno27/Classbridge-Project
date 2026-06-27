import { Clock, Calendar, User, MessageCircle } from 'lucide-react';
import type { LessonNote } from '@/types';

interface LessonCardProps {
  lesson: LessonNote;
  onClick?: () => void;
  showStatus?: boolean;
}

const statusConfig = {
  draft: { label: 'Draft', className: 'status-badge-draft' },
  submitted: { label: 'Pending Review', className: 'status-badge-submitted' },
  approved: { label: 'Approved', className: 'status-badge-approved' },
  correction_requested: { label: 'Correction Needed', className: 'status-badge-correction' },
};

export default function LessonCard({ lesson, onClick, showStatus = true }: LessonCardProps) {
  const status = statusConfig[lesson.status];

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl border bg-white p-4 sm:p-5 hover:shadow-md hover:border-emerald-200 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="bg-emerald-50 text-emerald-700 p-2.5 rounded-lg">
          <Clock className="h-5 w-5" />
        </div>
        {showStatus && (
          <span className={`status-badge ${status.className}`}>
            {status.label}
          </span>
        )}
      </div>

      <h3 className="font-semibold text-foreground mb-1">{lesson.topic}</h3>
      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{lesson.subTopic}</p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          Week {lesson.week}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {lesson.duration} mins
        </span>
        <span className="flex items-center gap-1">
          <User className="h-3.5 w-3.5" />
          {lesson.teacherName}
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle className="h-3.5 w-3.5" />
          Discussion
        </span>
      </div>

      {lesson.headteacherComment && (
        <div className="mt-3 p-2.5 bg-amber-50 rounded-lg text-xs text-amber-800">
          <span className="font-medium">Feedback:</span> {lesson.headteacherComment}
        </div>
      )}
    </button>
  );
}

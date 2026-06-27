import { Calendar, FileText, Star, ArrowRight } from 'lucide-react';
import type { Assignment } from '@/types';

interface AssignmentCardProps {
  assignment: Assignment;
  onClick?: () => void;
  dueSoon?: boolean;
}

export default function AssignmentCard({ assignment, onClick, dueSoon = false }: AssignmentCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl border bg-white p-4 sm:p-5 hover:shadow-md hover:border-emerald-200 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="bg-sky-50 text-sky-700 p-2.5 rounded-lg">
          <FileText className="h-5 w-5" />
        </div>
        <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-xs font-medium">
          <Star className="h-3 w-3" />
          {assignment.totalMarks} marks
        </div>
      </div>

      <h3 className="font-semibold text-foreground mb-1">{assignment.title}</h3>
      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{assignment.description}</p>

      <div className="flex items-center justify-between">
        <span className={`flex items-center gap-1 text-xs ${dueSoon ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
          <Calendar className="h-3.5 w-3.5" />
          Due: {new Date(assignment.dueDate).toLocaleDateString()}
        </span>
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-600 transition-colors" />
      </div>
    </button>
  );
}

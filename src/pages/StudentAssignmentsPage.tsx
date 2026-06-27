import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft, ClipboardList, Star, CheckCircle, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SubmissionForm from '@/components/assignment/SubmissionForm';
import { assignmentsApi, classesApi, submissionsApi } from '@/services/api';
import { useApp } from '@/contexts/AppContext';
import type { Assignment, Submission } from '@/types';

export default function StudentAssignmentsPage() {
  const navigate = useNavigate();
  const { state } = useApp();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, Submission>>({});
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showSubmit, setShowSubmit] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!state.currentUser) return;
    const studentClasses = await classesApi.getByStudent(state.currentUser.id);
    const allAssignments: Assignment[] = [];
    const subsMap: Record<string, Submission> = {};

    for (const c of studentClasses) {
      const [asgns, subs] = await Promise.all([
        assignmentsApi.getByClass(c.id),
        submissionsApi.getByStudent(state.currentUser.id),
      ]);
      allAssignments.push(...asgns);
      subs.forEach((s) => { subsMap[s.assignmentId] = s; });
    }

    setAssignments(allAssignments);
    setSubmissions(subsMap);
  };

  const pendingAssignments = assignments.filter((a) => {
    const sub = submissions[a.id];
    return !sub || sub.status === 'pending' || sub.status === 'returned';
  });
  const submittedAssignments = assignments.filter((a) => {
    const sub = submissions[a.id];
    return sub && (sub.status === 'submitted' || sub.status === 'graded');
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/student')}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>

      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-sky-100 text-sky-700 rounded-lg">
          <ClipboardList className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-semibold">My Assignments</h1>
          <p className="text-sm text-muted-foreground">View and submit your work</p>
        </div>
      </div>

      {/* Pending */}
      <div className="bg-white rounded-xl border p-4 sm:p-5">
        <h2 className="font-semibold flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-amber-500" />
          Pending ({pendingAssignments.length})
        </h2>
        {pendingAssignments.length === 0 ? (
          <div className="text-center py-6 text-emerald-700 bg-emerald-50 rounded-lg">
            <CheckCircle className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">All caught up!</p>
            <p className="text-sm">You have submitted all assignments.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingAssignments.map((a) => {
              const sub = submissions[a.id];
              const isReturned = sub?.status === 'returned';
              return (
              <button
                key={a.id}
                onClick={() => { setSelectedAssignment(a); setShowSubmit(true); }}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  isReturned ? 'border-amber-300 bg-amber-50/40 hover:bg-amber-50/60' : 'hover:border-emerald-200 hover:bg-emerald-50/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{a.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    isReturned ? 'bg-amber-100 text-amber-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {isReturned ? 'Needs Redo' : `Due ${new Date(a.dueDate).toLocaleDateString()}`}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.description}</p>
                {isReturned && sub?.feedback && (
                  <p className="text-xs text-amber-800 mt-2 italic">Teacher feedback: &quot;{sub.feedback}&quot;</p>
                )}
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <Star className="h-3.5 w-3.5" /> {a.totalMarks} marks
                </div>
              </button>
            );})}
          </div>
        )}
      </div>

      {/* Submitted */}
      {submittedAssignments.length > 0 && (
        <div className="bg-white rounded-xl border p-4 sm:p-5">
          <h2 className="font-semibold flex items-center gap-2 mb-4">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            Submitted ({submittedAssignments.length})
          </h2>
          <div className="space-y-3">
            {submittedAssignments.map((a) => {
              const sub = submissions[a.id];
              return (
                <div key={a.id} className="p-4 rounded-lg border bg-emerald-50/30">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{a.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      sub.status === 'graded' ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'
                    }`}>
                      {sub.status === 'graded' ? `Graded: ${sub.score}/${a.totalMarks}` : 'Submitted'}
                    </span>
                  </div>
                  {sub.feedback && (
                    <p className="text-xs text-emerald-700 mt-2 italic">&quot;{sub.feedback}&quot;</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Submit Dialog */}
      <Dialog open={showSubmit} onOpenChange={setShowSubmit}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submit Assignment</DialogTitle>
          </DialogHeader>
          {selectedAssignment && (
            <SubmissionForm
              assignment={selectedAssignment}
              onSuccess={() => { setShowSubmit(false); loadData(); }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

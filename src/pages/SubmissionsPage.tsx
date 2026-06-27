import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft, CheckSquare, UserCircle, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SubmissionGrader from '@/components/assignment/SubmissionGrader';
import { submissionsApi, assignmentsApi } from '@/services/api';
import { useApp } from '@/contexts/AppContext';
import type { Submission, Assignment } from '@/types';

export default function SubmissionsPage() {
  const navigate = useNavigate();
  const { state } = useApp();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [assignments, setAssignments] = useState<Record<string, Assignment>>({});
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showGrade, setShowGrade] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!state.currentUser) return;
    const subs = await submissionsApi.getByTeacher(state.currentUser.id);
    setSubmissions(subs);

    // Get assignment details
    const assignMap: Record<string, Assignment> = {};
    for (const sub of subs) {
      if (!assignMap[sub.assignmentId]) {
        const a = await assignmentsApi.getById(sub.assignmentId);
        if (a) assignMap[sub.assignmentId] = a;
      }
    }
    setAssignments(assignMap);
  };

  const pendingSubs = submissions.filter((s) => s.status === 'submitted');
  const returnedSubs = submissions.filter((s) => s.status === 'returned');
  const gradedSubs = submissions.filter((s) => s.status === 'graded');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/teacher')}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>

      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-amber-100 text-amber-700 rounded-lg">
          <CheckSquare className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-semibold">Student Submissions</h1>
          <p className="text-sm text-muted-foreground">Review and grade student work.</p>
        </div>
      </div>

      {/* Pending */}
      <div className="bg-white rounded-xl border p-4 sm:p-5">
        <h2 className="font-semibold flex items-center gap-2 mb-4">
          <Star className="h-4 w-4 text-amber-500" />
          Needs Grading ({pendingSubs.length})
        </h2>
        {pendingSubs.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">All submissions graded!</div>
        ) : (
          <div className="space-y-3">
            {pendingSubs.map((sub) => (
              <button
                key={sub.id}
                onClick={() => { setSelectedSubmission(sub); setShowGrade(true); }}
                className="w-full text-left p-4 rounded-lg border hover:border-emerald-200 hover:bg-emerald-50/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCircle className="h-5 w-5 text-emerald-600" />
                    <span className="font-medium">{sub.studentName}</span>
                  </div>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Pending</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{sub.assignmentTitle}</p>
                {sub.answer && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{sub.answer}</p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Returned */}
      {returnedSubs.length > 0 && (
        <div className="bg-white rounded-xl border p-4 sm:p-5">
          <h2 className="font-semibold flex items-center gap-2 mb-4">
            Awaiting Student Redo ({returnedSubs.length})
          </h2>
          <div className="space-y-3">
            {returnedSubs.map((sub) => (
              <div key={sub.id} className="p-4 rounded-lg border bg-amber-50/40">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{sub.studentName}</span>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Returned</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{sub.assignmentTitle}</p>
                {sub.feedback && (
                  <p className="text-xs text-amber-800 mt-2 italic">&quot;{sub.feedback}&quot;</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Graded */}
      <div className="bg-white rounded-xl border p-4 sm:p-5">
        <h2 className="font-semibold flex items-center gap-2 mb-4">
          <CheckSquare className="h-4 w-4 text-emerald-500" />
          Graded ({gradedSubs.length})
        </h2>
        {gradedSubs.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">No graded submissions yet.</div>
        ) : (
          <div className="space-y-3">
            {gradedSubs.map((sub) => (
              <div key={sub.id} className="p-4 rounded-lg border bg-emerald-50/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCircle className="h-5 w-5 text-emerald-600" />
                    <span className="font-medium">{sub.studentName}</span>
                  </div>
                  <span className="text-lg font-bold text-emerald-700">
                    {sub.score}/{assignments[sub.assignmentId]?.totalMarks || '?'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{sub.assignmentTitle}</p>
                {sub.feedback && (
                  <p className="text-xs text-emerald-700 mt-2 italic">&quot;{sub.feedback}&quot;</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grade Dialog */}
      <Dialog open={showGrade} onOpenChange={setShowGrade}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Grade Submission</DialogTitle>
          </DialogHeader>
          {selectedSubmission && assignments[selectedSubmission.assignmentId] && (
            <SubmissionGrader
              submission={selectedSubmission}
              totalMarks={assignments[selectedSubmission.assignmentId].totalMarks}
              onSuccess={() => { setShowGrade(false); loadData(); }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

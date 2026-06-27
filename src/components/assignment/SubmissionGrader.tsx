import { useState } from 'react';
import { Star, Send, FileText, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { submissionsApi, activitiesApi } from '@/services/api';
import { useApp } from '@/contexts/AppContext';
import type { Submission } from '@/types';

interface SubmissionGraderProps {
  submission: Submission;
  totalMarks: number;
  onSuccess?: () => void;
}

export default function SubmissionGrader({ submission, totalMarks, onSuccess }: SubmissionGraderProps) {
  const { state, dispatch } = useApp();
  const [score, setScore] = useState(submission.score?.toString() || '');
  const [feedback, setFeedback] = useState(submission.feedback || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    const scoreNum = parseInt(score);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > totalMarks) {
      toast.error(`Score must be between 0 and ${totalMarks}`);
      return;
    }
    if (!feedback.trim()) {
      toast.error('Please provide feedback');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await submissionsApi.grade(submission.id, scoreNum, feedback.trim());
      if (updated) {
        dispatch({ type: 'UPDATE_SUBMISSION', payload: updated });
        await activitiesApi.add({
          userId: state.currentUser!.id,
          userName: state.currentUser!.name,
          userRole: state.currentUser!.role,
          action: 'graded submission',
          target: `${submission.studentName} - ${submission.assignmentTitle} (${scoreNum}/${totalMarks})`,
        });
        toast.success('Submission graded successfully!');
        onSuccess?.();
      }
    } catch {
      toast.error('Failed to grade submission');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Student Answer */}
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <UserCircle className="h-5 w-5 text-emerald-600" />
          <span className="font-medium text-sm">{submission.studentName}&apos;s Answer</span>
        </div>
        <p className="text-sm whitespace-pre-wrap">{submission.answer}</p>
      </div>

      {/* Grade Form */}
      <form onSubmit={handleGrade} className="space-y-4 border-t pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium flex items-center gap-2 mb-1">
              <Star className="h-4 w-4 text-amber-500" />
              Score (out of {totalMarks})
            </label>
            <Input
              type="number"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              min={0}
              max={totalMarks}
              className="h-11"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium flex items-center gap-2 mb-1">
            <FileText className="h-4 w-4 text-emerald-600" />
            Feedback
          </label>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Provide constructive feedback..."
            className="min-h-[100px]"
          />
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 bg-emerald-700 hover:bg-emerald-800 text-white"
        >
          {isSubmitting ? 'Saving...' : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Submit Grade & Feedback
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

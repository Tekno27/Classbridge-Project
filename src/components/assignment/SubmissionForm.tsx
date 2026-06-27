import { useState } from 'react';
import { Send, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { submissionsApi, activitiesApi } from '@/services/api';
import { useApp } from '@/contexts/AppContext';
import type { Assignment } from '@/types';

interface SubmissionFormProps {
  assignment: Assignment;
  onSuccess?: () => void;
}

export default function SubmissionForm({ assignment, onSuccess }: SubmissionFormProps) {
  const { state, dispatch } = useApp();
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) {
      toast.error('Please write your answer');
      return;
    }

    setIsSubmitting(true);
    try {
      const submission = await submissionsApi.submit({
        assignmentId: assignment.id,
        assignmentTitle: assignment.title,
        studentId: state.currentUser!.id,
        studentName: state.currentUser!.name,
        classId: assignment.classId,
        answer: answer.trim(),
      });
      dispatch({ type: 'UPDATE_SUBMISSION', payload: submission });
      await activitiesApi.add({
        userId: state.currentUser!.id,
        userName: state.currentUser!.name,
        userRole: state.currentUser!.role,
        action: 'submitted assignment',
        target: assignment.title,
      });
      toast.success('Assignment submitted successfully!');
      setAnswer('');
      onSuccess?.();
    } catch {
      toast.error('Failed to submit assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-sky-50 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-4 w-4 text-sky-700" />
          <span className="font-medium text-sm">{assignment.title}</span>
        </div>
        <p className="text-sm text-muted-foreground">{assignment.description}</p>
        <p className="text-xs text-muted-foreground mt-2">Total Marks: {assignment.totalMarks}</p>
      </div>

      <Textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Write your answer here..."
        className="min-h-[200px]"
      />

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-11 bg-emerald-700 hover:bg-emerald-800 text-white"
      >
        {isSubmitting ? 'Submitting...' : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Submit Assignment
          </>
        )}
      </Button>
    </form>
  );
}

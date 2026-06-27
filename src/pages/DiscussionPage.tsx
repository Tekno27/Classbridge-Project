import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, MessageCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import QuestionThread from '@/components/discussion/QuestionThread';
import { questionsApi, lessonsApi, activitiesApi } from '@/services/api';
import { useApp } from '@/contexts/AppContext';
import type { Question, LessonNote } from '@/types';

export default function DiscussionPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [lesson, setLesson] = useState<LessonNote | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [showAsk, setShowAsk] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (lessonId) {
      loadData();
    }
  }, [lessonId]);

  const loadData = async () => {
    if (!lessonId) return;
    const [l, qs] = await Promise.all([
      lessonsApi.getById(lessonId),
      questionsApi.getByLesson(lessonId),
    ]);
    if (l) setLesson(l);
    setQuestions(qs);
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !lessonId || !lesson) return;

    setIsSubmitting(true);
    try {
      const q = await questionsApi.ask({
        lessonId,
        lessonTopic: lesson.topic,
        studentId: state.currentUser!.id,
        studentName: state.currentUser!.name,
        question: newQuestion.trim(),
      });
      dispatch({ type: 'ADD_QUESTION', payload: q });
      await activitiesApi.add({
        userId: state.currentUser!.id,
        userName: state.currentUser!.name,
        userRole: state.currentUser!.role,
        action: 'asked question',
        target: lesson.topic,
      });
      setNewQuestion('');
      setShowAsk(false);
      await loadData();
    } catch {
      // error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateQuestion = (updated: Question) => {
    setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>

      {lesson && (
        <div className="bg-white rounded-xl border p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-violet-100 text-violet-700 rounded-lg">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Discussion</h1>
              <p className="text-sm text-muted-foreground">{lesson.topic} - {lesson.className}</p>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 mb-4 text-sm">
            <p><strong>Subject:</strong> {lesson.subject}</p>
            <p className="mt-1"><strong>Teacher:</strong> {lesson.teacherName}</p>
          </div>

          {/* Ask Question */}
          {!showAsk ? (
            <Button
              variant="outline"
              className="w-full mb-4"
              onClick={() => setShowAsk(true)}
            >
              <Plus className="h-4 w-4 mr-1" /> Ask a Question
            </Button>
          ) : (
            <form onSubmit={handleAsk} className="mb-4 p-4 border rounded-lg bg-white">
              <Textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Type your question about this lesson..."
                className="min-h-[80px] mb-3"
              />
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAsk(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting || !newQuestion.trim()}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white"
                >
                  {isSubmitting ? 'Posting...' : 'Post Question'}
                </Button>
              </div>
            </form>
          )}

          {/* Questions */}
          {questions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-10 w-10 mx-auto mb-2 text-muted" />
              <p>No questions yet. Be the first to ask!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q) => (
                <QuestionThread key={q.id} question={q} onUpdate={handleUpdateQuestion} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

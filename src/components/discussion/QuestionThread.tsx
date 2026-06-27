import { useState } from 'react';
import { MessageCircle, Send, UserCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';
import { questionsApi, activitiesApi } from '@/services/api';
import { useApp } from '@/contexts/AppContext';
import type { Question } from '@/types';

interface QuestionThreadProps {
  question: Question;
  onUpdate: (q: Question) => void;
}

export default function QuestionThread({ question, onUpdate }: QuestionThreadProps) {
  const { state } = useApp();
  const [reply, setReply] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;

    setIsSubmitting(true);
    try {
      const updated = await questionsApi.reply(question.id, {
        userId: state.currentUser!.id,
        userName: state.currentUser!.name,
        userRole: state.currentUser!.role,
        message: reply.trim(),
      });
      if (updated) {
        onUpdate(updated);
        await activitiesApi.add({
          userId: state.currentUser!.id,
          userName: state.currentUser!.name,
          userRole: state.currentUser!.role,
          action: 'replied to question',
          target: question.lessonTopic,
        });
        setReply('');
      }
    } catch {
      // error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border bg-white p-4 sm:p-5 space-y-4">
      {/* Question */}
      <div className="flex gap-3">
        <div className="p-2 bg-violet-50 rounded-full h-fit">
          <MessageCircle className="h-4 w-4 text-violet-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{question.studentName}</span>
            <span className="text-xs text-muted-foreground capitalize bg-violet-50 px-2 py-0.5 rounded-full">
              student
            </span>
          </div>
          <p className="text-sm">{question.question}</p>
          <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>

      {/* Replies */}
      {question.replies.length > 0 && (
        <div className="space-y-3 pl-8 border-l-2 border-muted">
          {question.replies.map((r) => (
            <div key={r.id} className="flex gap-3">
              <div className={`p-2 rounded-full h-fit ${r.userRole === 'teacher' ? 'bg-emerald-50' : 'bg-gray-50'}`}>
                <UserCircle className={`h-4 w-4 ${r.userRole === 'teacher' ? 'text-emerald-600' : 'text-gray-500'}`} />
              </div>
              <div className="flex-1 bg-muted/40 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{r.userName}</span>
                  <span className={`text-xs capitalize px-2 py-0.5 rounded-full ${
                    r.userRole === 'teacher' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {r.userRole}
                  </span>
                </div>
                <p className="text-sm">{r.message}</p>
                <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply Form */}
      <form onSubmit={handleReply} className="flex gap-2 pt-2">
        <Textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Write a reply..."
          className="min-h-[60px] flex-1"
        />
        <Button
          type="submit"
          disabled={isSubmitting || !reply.trim()}
          className="self-end h-10 bg-emerald-700 hover:bg-emerald-800"
          size="sm"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

import { Clock, Calendar, User, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { LessonNote } from '@/types';

interface LessonReviewCardProps {
  lesson: LessonNote;
  onApprove: (id: string, comment?: string) => void;
  onRequestCorrection: (id: string, comment: string) => void;
}

export default function LessonReviewCard({ lesson, onApprove, onRequestCorrection }: LessonReviewCardProps) {
  const [comment, setComment] = useState('');
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="rounded-xl border bg-white p-4 sm:p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-foreground">{lesson.topic}</h3>
          <p className="text-sm text-muted-foreground">{lesson.subTopic}</p>
        </div>
        <span className="status-badge status-badge-submitted">Pending Review</span>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <User className="h-3.5 w-3.5" />
          {lesson.teacherName}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          Week {lesson.week}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {lesson.duration} mins
        </span>
      </div>

      {/* Preview */}
      <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
        <p><strong>Objectives:</strong> {lesson.learningObjectives}</p>
        <p><strong>Materials:</strong> {lesson.teachingMaterials}</p>
        <p><strong>Introduction:</strong> {lesson.introduction}</p>
      </div>

      {/* Time Allocations */}
      {lesson.timeAllocations.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {lesson.timeAllocations.map((ta) => (
            <span key={ta.id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-50 text-sky-700 rounded-full text-xs">
              {ta.activity}: {ta.minutes}m
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      {!showActions ? (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowActions(true)}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Review
          </Button>
          <Button
            size="sm"
            className="bg-emerald-700 hover:bg-emerald-800 text-white"
            onClick={() => onApprove(lesson.id, 'Approved for teaching.')}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Quick Approve
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add your feedback or comments..."
            className="min-h-[80px]"
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowActions(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                if (!comment.trim()) return;
                onRequestCorrection(lesson.id, comment);
                setShowActions(false);
                setComment('');
              }}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Request Correction
            </Button>
            <Button
              size="sm"
              className="bg-emerald-700 hover:bg-emerald-800 text-white"
              onClick={() => {
                onApprove(lesson.id, comment || 'Approved for teaching.');
                setShowActions(false);
                setComment('');
              }}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Approve
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

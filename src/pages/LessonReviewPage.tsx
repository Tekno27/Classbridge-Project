import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, CheckCircle, XCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LessonReviewCard from '@/components/lesson/LessonReviewCard';
import { lessonsApi, activitiesApi } from '@/services/api';
import { useApp } from '@/contexts/AppContext';
import type { LessonNote } from '@/types';

export default function LessonReviewPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [pendingLessons, setPendingLessons] = useState<LessonNote[]>([]);
  const [correctionLessons, setCorrectionLessons] = useState<LessonNote[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'corrections'>('pending');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [pending, corrections] = await Promise.all([
      lessonsApi.getPendingReview(),
      lessonsApi.getByStatus('correction_requested'),
    ]);
    setPendingLessons(pending);
    setCorrectionLessons(corrections);
  };

  const handleApprove = async (id: string, comment?: string) => {
    const updated = await lessonsApi.approve(id, comment);
    if (updated) {
      dispatch({ type: 'UPDATE_LESSON', payload: updated });
      await activitiesApi.add({
        userId: state.currentUser!.id,
        userName: state.currentUser!.name,
        userRole: state.currentUser!.role,
        action: 'approved lesson note',
        target: updated.topic,
      });
      await loadData();
    }
  };

  const handleRequestCorrection = async (id: string, comment: string) => {
    const updated = await lessonsApi.requestCorrection(id, comment);
    if (updated) {
      dispatch({ type: 'UPDATE_LESSON', payload: updated });
      await activitiesApi.add({
        userId: state.currentUser!.id,
        userName: state.currentUser!.name,
        userRole: state.currentUser!.role,
        action: 'requested correction',
        target: updated.topic,
      });
      await loadData();
    }
  };

  const displayLessons = activeTab === 'pending' ? pendingLessons : correctionLessons;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/headteacher')}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
      </Button>

      <div className="bg-white rounded-xl border p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-amber-100 text-amber-700 rounded-lg">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Review Lesson Notes</h1>
            <p className="text-sm text-muted-foreground">Approve or request corrections.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'border hover:bg-muted'
            }`}
          >
            <ClockIcon />
            Pending ({pendingLessons.length})
          </button>
          <button
            onClick={() => setActiveTab('corrections')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'corrections' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'border hover:bg-muted'
            }`}
          >
            <XCircle className="h-4 w-4" />
            Corrections ({correctionLessons.length})
          </button>
        </div>

        {displayLessons.length === 0 ? (
          <div className="text-center py-12">
            {activeTab === 'pending' ? (
              <>
                <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                <p className="font-medium text-emerald-700">All caught up!</p>
                <p className="text-sm text-muted-foreground">No lesson notes to review.</p>
              </>
            ) : (
              <>
                <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                <p className="font-medium">No corrections pending</p>
                <p className="text-sm text-muted-foreground">All corrected notes have been resubmitted.</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {displayLessons.map((lesson) => (
              <LessonReviewCard
                key={lesson.id}
                lesson={lesson}
                onApprove={handleApprove}
                onRequestCorrection={handleRequestCorrection}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ClockIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

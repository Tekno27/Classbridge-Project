import { useCallback } from 'react';
import type { LessonNote, TimeAllocation } from '@/types';

const DRAFT_KEY = 'cb_lesson_draft';
const DRAFT_TIME_KEY = 'cb_lesson_draft_time';

interface DraftData {
  lessonData: Partial<LessonNote>;
  timeAllocations: TimeAllocation[];
}

export function useOfflineDraft() {
  const saveDraft = useCallback((lessonData: Partial<LessonNote>, timeAllocations: TimeAllocation[]) => {
    try {
      const draft: DraftData = { lessonData, timeAllocations };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      localStorage.setItem(DRAFT_TIME_KEY, new Date().toISOString());
      return true;
    } catch {
      return false;
    }
  }, []);

  const loadDraft = useCallback((): DraftData | null => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      return saved ? (JSON.parse(saved) as DraftData) : null;
    } catch {
      return null;
    }
  }, []);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
    localStorage.removeItem(DRAFT_TIME_KEY);
  }, []);

  const getLastSavedTime = useCallback((): string | null => {
    return localStorage.getItem(DRAFT_TIME_KEY);
  }, []);

  const hasDraft = useCallback((): boolean => {
    return localStorage.getItem(DRAFT_KEY) !== null;
  }, []);

  return { saveDraft, loadDraft, clearDraft, getLastSavedTime, hasDraft };
}

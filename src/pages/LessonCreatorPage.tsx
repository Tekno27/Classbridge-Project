import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft, FileText, Save, Send, Clock, Download, Upload, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import TimeAllocationChecker from '@/components/lesson/TimeAllocationChecker';
import { lessonsApi, activitiesApi } from '@/services/api';
import { useApp } from '@/contexts/AppContext';
import { useOfflineDraft } from '@/hooks/useOfflineDraft';
import type { TimeAllocation } from '@/types';

export default function LessonCreatorPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const { saveDraft, loadDraft, clearDraft, getLastSavedTime, hasDraft } = useOfflineDraft();

  const teacherClasses = state.classes.filter((c) => c.teacherId === state.currentUser?.id);

  const [classId, setClassId] = useState('');
  const [week, setWeek] = useState('1');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [subTopic, setSubTopic] = useState('');
  const [duration, setDuration] = useState('60');
  const [learningObjectives, setLearningObjectives] = useState('');
  const [previousKnowledge, setPreviousKnowledge] = useState('');
  const [teachingMaterials, setTeachingMaterials] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [teacherActivities, setTeacherActivities] = useState('');
  const [learnerActivities, setLearnerActivities] = useState('');
  const [assessment, setAssessment] = useState('');
  const [closure, setClosure] = useState('');
  const [remarks, setRemarks] = useState('');
  const [timeAllocations, setTimeAllocations] = useState<TimeAllocation[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Auto-load draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      const d = draft.lessonData;
      if (d.classId) setClassId(d.classId);
      if (d.week) setWeek(d.week.toString());
      if (d.date) setDate(d.date);
      if (d.subject) setSubject(d.subject);
      if (d.topic) setTopic(d.topic);
      if (d.subTopic) setSubTopic(d.subTopic);
      if (d.duration) setDuration(d.duration.toString());
      if (d.learningObjectives) setLearningObjectives(d.learningObjectives);
      if (d.previousKnowledge) setPreviousKnowledge(d.previousKnowledge);
      if (d.teachingMaterials) setTeachingMaterials(d.teachingMaterials);
      if (d.introduction) setIntroduction(d.introduction);
      if (d.teacherActivities) setTeacherActivities(d.teacherActivities);
      if (d.learnerActivities) setLearnerActivities(d.learnerActivities);
      if (d.assessment) setAssessment(d.assessment);
      if (d.closure) setClosure(d.closure);
      if (d.remarks) setRemarks(d.remarks);
      if (draft.timeAllocations) setTimeAllocations(draft.timeAllocations);

      const savedTime = getLastSavedTime();
      if (savedTime) setLastSaved(savedTime);

      toast.info('Draft loaded from local storage');
    }
  }, []);

  const selectedClass = teacherClasses.find((c) => c.id === classId);

  const getLessonData = () => ({
    classId,
    className: selectedClass?.name || '',
    teacherId: state.currentUser!.id,
    teacherName: state.currentUser!.name,
    subject: subject || selectedClass?.subject || '',
    week: parseInt(week) || 1,
    date,
    topic,
    subTopic,
    duration: parseInt(duration) || 60,
    learningObjectives,
    previousKnowledge,
    teachingMaterials,
    introduction,
    teacherActivities,
    learnerActivities,
    assessment,
    closure,
    remarks,
    timeAllocations,
  });

  const handleSaveDraft = () => {
    const lessonData = getLessonData();
    const success = saveDraft(lessonData, timeAllocations);
    if (success) {
      setLastSaved(new Date().toISOString());
      toast.success('Draft saved locally');
    } else {
      toast.error('Failed to save draft');
    }
  };

  const handleLoadDraft = () => {
    const draft = loadDraft();
    if (draft) {
      const d = draft.lessonData;
      if (d.classId) setClassId(d.classId);
      if (d.topic) setTopic(d.topic);
      if (d.subTopic) setSubTopic(d.subTopic);
      if (d.duration) setDuration(d.duration.toString());
      if (d.learningObjectives) setLearningObjectives(d.learningObjectives);
      if (d.introduction) setIntroduction(d.introduction);
      if (d.teacherActivities) setTeacherActivities(d.teacherActivities);
      if (d.learnerActivities) setLearnerActivities(d.learnerActivities);
      if (d.assessment) setAssessment(d.assessment);
      if (d.closure) setClosure(d.closure);
      if (draft.timeAllocations) setTimeAllocations(draft.timeAllocations);
      toast.success('Draft loaded');
    } else {
      toast.info('No draft found');
    }
  };

  const handleClearDraft = () => {
    clearDraft();
    setLastSaved(null);
    toast.success('Draft cleared');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId || !topic.trim() || !duration) {
      toast.error('Please fill in Class, Topic, and Duration');
      return;
    }

    setIsSubmitting(true);
    try {
      const lessonData = getLessonData();
      const lesson = await lessonsApi.create(lessonData);
      dispatch({ type: 'ADD_LESSON', payload: lesson });
      await activitiesApi.add({
        userId: state.currentUser!.id,
        userName: state.currentUser!.name,
        userRole: state.currentUser!.role,
        action: 'created lesson note',
        target: `${topic} - Week ${week}`,
      });
      clearDraft();
      toast.success('Lesson note created!');
      navigate('/teacher/lessons');
    } catch {
      toast.error('Failed to create lesson note');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!classId || !topic.trim() || !duration) {
      toast.error('Please fill in Class, Topic, and Duration');
      return;
    }

    setIsSubmitting(true);
    try {
      const lessonData = getLessonData();
      const lesson = await lessonsApi.create(lessonData);
      const submitted = await lessonsApi.submit(lesson.id);
      if (submitted) {
        dispatch({ type: 'UPDATE_LESSON', payload: submitted });
        await activitiesApi.add({
          userId: state.currentUser!.id,
          userName: state.currentUser!.name,
          userRole: state.currentUser!.role,
          action: 'submitted lesson note for review',
          target: `${topic} - Week ${week}`,
        });
        clearDraft();
        toast.success('Lesson note submitted for review!');
        navigate('/teacher/lessons');
      }
    } catch {
      toast.error('Failed to submit lesson note');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatLastSaved = () => {
    if (!lastSaved) return null;
    const diff = Date.now() - new Date(lastSaved).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate('/teacher')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Saved {formatLastSaved()}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={handleSaveDraft}>
            <Download className="h-4 w-4 mr-1" /> Save Draft
          </Button>
          {hasDraft() && (
            <>
              <Button variant="outline" size="sm" onClick={handleLoadDraft}>
                <Upload className="h-4 w-4 mr-1" /> Load
              </Button>
              <Button variant="outline" size="sm" onClick={handleClearDraft}>
                <Trash2 className="h-4 w-4 mr-1" /> Clear
              </Button>
            </>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-emerald-600" />
            <h2 className="font-semibold">Basic Information</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Class *</Label>
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {teacherClasses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                value={subject || selectedClass?.subject || ''}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={selectedClass?.subject || 'Subject'}
              />
            </div>
            <div className="space-y-2">
              <Label>Week *</Label>
              <Select value={week} onValueChange={setWeek}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 14 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>Week {i + 1}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Topic *</Label>
              <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., Photosynthesis" />
            </div>
            <div className="space-y-2">
              <Label>Sub-topic</Label>
              <Input value={subTopic} onChange={(e) => setSubTopic(e.target.value)} placeholder="Brief description" />
            </div>
            <div className="space-y-2">
              <Label>Duration (minutes) *</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[30, 35, 40, 45, 50, 60, 70, 80, 90].map((m) => (
                    <SelectItem key={m} value={m.toString()}>{m} minutes</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Teaching Plan */}
        <div className="bg-white rounded-xl border p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-emerald-600" />
            <h2 className="font-semibold">Teaching Plan</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Learning Objectives</Label>
              <Textarea value={learningObjectives} onChange={(e) => setLearningObjectives(e.target.value)} placeholder="What will students learn?" />
            </div>
            <div className="space-y-2">
              <Label>Previous Knowledge</Label>
              <Textarea value={previousKnowledge} onChange={(e) => setPreviousKnowledge(e.target.value)} placeholder="What do students already know?" />
            </div>
            <div className="space-y-2">
              <Label>Teaching Materials</Label>
              <Textarea value={teachingMaterials} onChange={(e) => setTeachingMaterials(e.target.value)} placeholder="List required materials" />
            </div>
            <div className="space-y-2">
              <Label>Introduction</Label>
              <Textarea value={introduction} onChange={(e) => setIntroduction(e.target.value)} placeholder="How will you introduce the lesson?" />
            </div>
            <div className="space-y-2">
              <Label>Teacher Activities</Label>
              <Textarea value={teacherActivities} onChange={(e) => setTeacherActivities(e.target.value)} placeholder="What will you do during the lesson?" />
            </div>
            <div className="space-y-2">
              <Label>Learner Activities</Label>
              <Textarea value={learnerActivities} onChange={(e) => setLearnerActivities(e.target.value)} placeholder="What will students do?" />
            </div>
            <div className="space-y-2">
              <Label>Assessment</Label>
              <Textarea value={assessment} onChange={(e) => setAssessment(e.target.value)} placeholder="How will you assess learning?" />
            </div>
            <div className="space-y-2">
              <Label>Closure</Label>
              <Textarea value={closure} onChange={(e) => setClosure(e.target.value)} placeholder="How will you wrap up the lesson?" />
            </div>
            <div className="space-y-2">
              <Label>Remarks</Label>
              <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Any additional notes" />
            </div>
          </div>
        </div>

        {/* Time Allocation Checker - THE KEY FEATURE */}
        <div className="bg-white rounded-xl border p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-emerald-600" />
            <h2 className="font-semibold">Lesson Time Allocation</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Add each activity and its duration. The system will check if your lesson time is balanced.
          </p>
          <TimeAllocationChecker
            duration={parseInt(duration) || 60}
            allocations={timeAllocations}
            onChange={setTimeAllocations}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pb-8">
          <Button
            type="submit"
            variant="outline"
            disabled={isSubmitting}
            className="h-11 flex-1"
          >
            <Save className="h-4 w-4 mr-2" />
            Save as Draft
          </Button>
          <Button
            type="button"
            onClick={handleSubmitForReview}
            disabled={isSubmitting}
            className="h-11 flex-1 bg-emerald-700 hover:bg-emerald-800 text-white"
          >
            <Send className="h-4 w-4 mr-2" />
            Submit for Review
          </Button>
        </div>
      </form>
    </div>
  );
}

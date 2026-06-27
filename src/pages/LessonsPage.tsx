import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, FileText, MessageCircle, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { classesApi, lessonsApi } from '@/services/api';
import { useApp } from '@/contexts/AppContext';
import type { LessonNote, Class } from '@/types';

export default function LessonsPage() {
  const navigate = useNavigate();
  const { state } = useApp();
  const [lessons, setLessons] = useState<LessonNote[]>([]);
  const [studentClasses, setStudentClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!state.currentUser) return;
    const cls = await classesApi.getByStudent(state.currentUser.id);
    setStudentClasses(cls);

    const allLessons: LessonNote[] = [];
    for (const c of cls) {
      const ls = await lessonsApi.getByClass(c.id);
      allLessons.push(...ls);
    }
    setLessons(allLessons);
  };

  const filteredLessons = selectedClassId === 'all'
    ? lessons
    : lessons.filter((l) => l.classId === selectedClassId);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/student')}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>

      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-semibold">Available Lessons</h1>
          <p className="text-sm text-muted-foreground">Approved lessons from your classes</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedClassId('all')}
          className={`px-3 py-1.5 rounded-lg text-sm border whitespace-nowrap transition-colors ${
            selectedClassId === 'all' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'hover:bg-muted'
          }`}
        >
          All Classes
        </button>
        {studentClasses.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedClassId(c.id)}
            className={`px-3 py-1.5 rounded-lg text-sm border whitespace-nowrap transition-colors ${
              selectedClassId === c.id ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'hover:bg-muted'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {filteredLessons.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">No approved lessons yet</p>
          <p className="text-sm text-muted-foreground">Your teachers haven&apos;t published any lessons for this class.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLessons.map((lesson) => (
            <div key={lesson.id} className="bg-white rounded-xl border p-4 sm:p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{lesson.topic}</h3>
                  <p className="text-sm text-muted-foreground">{lesson.subTopic}</p>
                </div>
                <span className="status-badge status-badge-approved">Approved</span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  {lesson.className}
                </span>
                <span>Week {lesson.week}</span>
                <span>{lesson.duration} mins</span>
              </div>

              <div className="bg-muted/50 rounded-lg p-3 mb-3 text-sm space-y-1">
                <p><strong>Objectives:</strong> {lesson.learningObjectives}</p>
                <p><strong>Materials:</strong> {lesson.teachingMaterials}</p>
              </div>

              {lesson.headteacherComment && (
                <div className="bg-emerald-50 rounded-lg p-2.5 mb-3 text-xs text-emerald-700">
                  <strong>Headteacher:</strong> {lesson.headteacherComment}
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/discussion/${lesson.id}`)}
              >
                <MessageCircle className="h-4 w-4 mr-1" /> Discussion
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

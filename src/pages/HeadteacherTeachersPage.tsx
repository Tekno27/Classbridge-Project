import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Users, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usersApi } from '@/services/api';
import type { TeacherSummary } from '@/types';
import { toast } from 'sonner';

export default function HeadteacherTeachersPage() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<TeacherSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const result = await usersApi.getTeachers();
        setTeachers(result);
      } catch {
        toast.error('Failed to load teachers');
      } finally {
        setIsLoading(false);
      }
    };

    loadTeachers();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/headteacher')}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>

      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-purple-100 text-purple-700 rounded-lg">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-semibold">Teachers</h1>
          <p className="text-sm text-muted-foreground">School teaching staff overview</p>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading teachers...</p>
      ) : teachers.length === 0 ? (
        <div className="bg-white rounded-xl border p-6 text-center">
          <p className="text-sm text-muted-foreground">No teachers registered yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {teachers.map((teacher) => (
            <div key={teacher.id} className="bg-white rounded-xl border p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-full">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{teacher.name}</h3>
                    <p className="text-sm text-muted-foreground">{teacher.email}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {teacher.lessonCount} lessons
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  {teacher.approvedLessonCount} approved
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

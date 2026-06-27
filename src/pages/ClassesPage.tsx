import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ClassCard from '@/components/class/ClassCard';
import { classesApi } from '@/services/api';
import { useApp } from '@/contexts/AppContext';
import type { Class } from '@/types';

export default function ClassesPage() {
  const navigate = useNavigate();
  const { state } = useApp();
  const [classes, setClasses] = useState<Class[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!state.currentUser) return;
    if (state.currentUser.role === 'teacher') {
      const c = await classesApi.getByTeacher(state.currentUser.id);
      setClasses(c);
    } else if (state.currentUser.role === 'student') {
      const c = await classesApi.getByStudent(state.currentUser.id);
      setClasses(c);
    }
  };

  const isTeacher = state.currentUser?.role === 'teacher';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(`/${state.currentUser?.role}`)}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">{isTeacher ? 'My Classes' : 'My Classes'}</h1>
            <p className="text-sm text-muted-foreground">
              {isTeacher ? 'Classes assigned to you by the headteacher' : 'Classes you have been enrolled in'}
            </p>
          </div>
        </div>
      </div>

      {classes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">No classes yet</p>
          <p className="text-sm text-muted-foreground">
            {isTeacher ? 'Your headteacher will assign classes to you.' : 'Your headteacher will enroll you in classes.'}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {classes.map((c) => (
            <ClassCard key={c.id} cls={c} />
          ))}
        </div>
      )}
    </div>
  );
}

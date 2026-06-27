import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, BookOpen, PlusCircle } from 'lucide-react';
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
              {isTeacher ? 'Classes you teach' : 'Classes you have joined'}
            </p>
          </div>
        </div>
        {isTeacher && (
          <Button className="bg-emerald-700 hover:bg-emerald-800 text-white" onClick={() => navigate('/teacher/class/new')}>
            <PlusCircle className="h-4 w-4 mr-1" /> Create
          </Button>
        )}
      </div>

      {classes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">No classes yet</p>
          <p className="text-sm text-muted-foreground">
            {isTeacher ? 'Create your first class to get started.' : 'Join a class using a class code.'}
          </p>
          {!isTeacher && (
            <Button className="mt-4" onClick={() => navigate('/student/join')}>
              Join Class
            </Button>
          )}
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

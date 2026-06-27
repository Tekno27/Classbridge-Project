import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, BookOpen, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ClassCard from '@/components/class/ClassCard';
import { classesApi } from '@/services/api';
import type { Class } from '@/types';

export default function HeadteacherClassesPage() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<Class[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const c = await classesApi.getAll();
    setClasses(c);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/headteacher')}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">All Classes</h1>
            <p className="text-sm text-muted-foreground">Overview of all classes in the school</p>
          </div>
        </div>
        <Button className="bg-emerald-700 hover:bg-emerald-800 text-white" onClick={() => navigate('/headteacher/assign-class')}>
          <PlusCircle className="h-4 w-4 mr-1" /> Assign Class
        </Button>
      </div>

      {classes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">No classes yet</p>
          <p className="text-sm text-muted-foreground mb-4">Create teachers and students first, then assign classes.</p>
          <Button variant="outline" onClick={() => navigate('/headteacher/assign-class')}>
            Assign First Class
          </Button>
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

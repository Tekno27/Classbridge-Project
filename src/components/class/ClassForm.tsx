import { useState } from 'react';
import { BookOpen, GraduationCap, Calendar, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { classesApi, activitiesApi } from '@/services/api';
import { useApp } from '@/contexts/AppContext';

const levels = ['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6', 'JHS 1', 'JHS 2', 'JHS 3', 'SHS 1', 'SHS 2', 'SHS 3'];
const subjects = ['English Language', 'Mathematics', 'Integrated Science', 'Social Studies', 'ICT', 'Ghanaian Language', 'French', 'RME', 'Creative Arts', 'PE'];
const terms = ['First Term', 'Second Term', 'Third Term'];

interface ClassFormProps {
  onSuccess?: () => void;
}

export default function ClassForm({ onSuccess }: ClassFormProps) {
  const { state, dispatch } = useApp();
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [level, setLevel] = useState('');
  const [term, setTerm] = useState('Second Term');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !subject || !level) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const newClass = await classesApi.create({
        name: name.trim(),
        subject,
        level,
        term,
        teacherId: state.currentUser!.id,
        studentIds: [],
      });
      dispatch({ type: 'ADD_CLASS', payload: newClass });
      await activitiesApi.add({
        userId: state.currentUser!.id,
        userName: state.currentUser!.name,
        userRole: state.currentUser!.role,
        action: 'created class',
        target: newClass.name,
      });
      toast.success(`Class "${newClass.name}" created! Code: ${newClass.code}`);
      setName('');
      setSubject('');
      setLevel('');
      onSuccess?.();
    } catch {
      toast.error('Failed to create class');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="className" className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-emerald-600" />
          Class Name
        </Label>
        <Input
          id="className"
          placeholder="e.g., JHS 2 Integrated Science"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-11"
        />
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-emerald-600" />
          Subject
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {subjects.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSubject(s)}
              className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                subject === s
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-medium'
                  : 'bg-white border-border hover:border-emerald-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-emerald-600" />
          Level
        </Label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {levels.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLevel(l)}
              className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                level === l
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-medium'
                  : 'bg-white border-border hover:border-emerald-200'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-emerald-600" />
          Term
        </Label>
        <div className="flex gap-2">
          {terms.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTerm(t)}
              className={`px-4 py-2 rounded-lg text-sm border transition-colors flex-1 ${
                term === t
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-medium'
                  : 'bg-white border-border hover:border-emerald-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-11 bg-emerald-700 hover:bg-emerald-800 text-white"
      >
        {isSubmitting ? 'Creating...' : 'Create Class'}
      </Button>
    </form>
  );
}

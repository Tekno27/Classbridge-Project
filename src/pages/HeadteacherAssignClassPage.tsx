import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, BookOpen, GraduationCap, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { classesApi, usersApi } from '@/services/api';
import type { User, TeacherSummary } from '@/types';

const levels = ['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6', 'JHS 1', 'JHS 2', 'JHS 3', 'SHS 1', 'SHS 2', 'SHS 3'];
const subjects = ['English Language', 'Mathematics', 'Integrated Science', 'Social Studies', 'ICT', 'Ghanaian Language', 'French', 'RME', 'Creative Arts', 'PE'];
const terms = ['First Term', 'Second Term', 'Third Term'];

export default function HeadteacherAssignClassPage() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<TeacherSummary[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [level, setLevel] = useState('');
  const [term, setTerm] = useState('Second Term');
  const [teacherId, setTeacherId] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [teacherList, studentList] = await Promise.all([
        usersApi.getTeachers(),
        usersApi.getStudents(),
      ]);
      setTeachers(teacherList);
      setStudents(studentList);
      if (teacherList.length > 0) {
        setTeacherId(teacherList[0].id);
      }
    };
    load();
  }, []);

  const toggleStudent = (studentId: string) => {
    setSelectedStudents((current) => (
      current.includes(studentId)
        ? current.filter((id) => id !== studentId)
        : [...current, studentId]
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !subject || !level || !teacherId) {
      toast.error('Please fill in all required fields and select a teacher');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await classesApi.create({
        name: name.trim(),
        subject,
        level,
        term,
        teacherId,
        studentIds: selectedStudents,
      });
      toast.success(`Class "${created.name}" assigned to ${created.teacherName}`);
      navigate('/headteacher/classes');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create class');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/headteacher/classes')}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>

      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-semibold">Assign Class</h1>
          <p className="text-sm text-muted-foreground">Create a class and assign a teacher and students</p>
        </div>
      </div>

      {teachers.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center">
          <p className="text-sm text-amber-800">Create at least one teacher before assigning classes.</p>
          <Button className="mt-4" variant="outline" onClick={() => navigate('/headteacher/users')}>
            Create Teachers
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-4 sm:p-6 space-y-5">
          <div className="space-y-2">
            <Label>Class Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., JHS 2 Integrated Science" className="h-11" />
          </div>

          <div className="space-y-2">
            <Label>Subject</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {subjects.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSubject(s)}
                  className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                    subject === s ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-medium' : 'bg-white border-border'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Level</Label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {levels.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLevel(l)}
                  className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                    level === l ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-medium' : 'bg-white border-border'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Term</Label>
            <div className="flex gap-2">
              {terms.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTerm(t)}
                  className={`px-4 py-2 rounded-lg text-sm border transition-colors flex-1 ${
                    term === t ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-medium' : 'bg-white border-border'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-emerald-600" />
              Assign Teacher
            </Label>
            <div className="space-y-2">
              {teachers.map((teacher) => (
                <button
                  key={teacher.id}
                  type="button"
                  onClick={() => setTeacherId(teacher.id)}
                  className={`w-full text-left rounded-lg border p-3 transition-colors ${
                    teacherId === teacher.id ? 'border-emerald-300 bg-emerald-50' : 'hover:border-emerald-200'
                  }`}
                >
                  <p className="font-medium text-sm">{teacher.name}</p>
                  <p className="text-xs text-muted-foreground">{teacher.email}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-600" />
              Assign Students
            </Label>
            {students.length === 0 ? (
              <p className="text-sm text-muted-foreground">No students available. Create student accounts first.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                {students.map((student) => (
                  <label key={student.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/40 cursor-pointer">
                    <Checkbox
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={() => toggleStudent(student.id)}
                    />
                    <div>
                      <p className="text-sm font-medium">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.email}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full h-11 bg-emerald-700 hover:bg-emerald-800 text-white">
            {isSubmitting ? 'Assigning...' : 'Create & Assign Class'}
          </Button>
        </form>
      )}
    </div>
  );
}

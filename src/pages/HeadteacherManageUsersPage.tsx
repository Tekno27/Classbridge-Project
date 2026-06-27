import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Users, GraduationCap, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { usersApi } from '@/services/api';
import type { User, TeacherSummary } from '@/types';

export default function HeadteacherManageUsersPage() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<TeacherSummary[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'teacher' | 'student'>('teacher');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadUsers = async () => {
    const [teacherList, studentList] = await Promise.all([
      usersApi.getTeachers(),
      usersApi.getStudents(),
    ]);
    setTeachers(teacherList);
    setStudents(studentList);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await usersApi.createUser({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });
      toast.success(`${role === 'teacher' ? 'Teacher' : 'Student'} account created`);
      setName('');
      setEmail('');
      setPassword('');
      await loadUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <h1 className="text-lg font-semibold">Manage Users</h1>
          <p className="text-sm text-muted-foreground">Create teacher and student accounts for your school</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr,1.2fr] gap-6">
        <div className="bg-white rounded-xl border p-4 sm:p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-emerald-600" />
            Create Account
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={role === 'teacher' ? 'default' : 'outline'}
                className={role === 'teacher' ? 'bg-emerald-700 hover:bg-emerald-800' : ''}
                onClick={() => setRole('teacher')}
              >
                Teacher
              </Button>
              <Button
                type="button"
                variant={role === 'student' ? 'default' : 'outline'}
                className={role === 'student' ? 'bg-emerald-700 hover:bg-emerald-800' : ''}
                onClick={() => setRole('student')}
              >
                Student
              </Button>
            </div>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="h-11" />
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="h-11" />
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Temporary password (min 6 chars)" className="h-11" />
            <Button type="submit" disabled={isSubmitting} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white">
              {isSubmitting ? 'Creating...' : `Create ${role === 'teacher' ? 'Teacher' : 'Student'}`}
            </Button>
          </form>
        </div>

        <div className="bg-white rounded-xl border p-4 sm:p-5">
          <Tabs defaultValue="teachers">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="teachers">Teachers ({teachers.length})</TabsTrigger>
              <TabsTrigger value="students">Students ({students.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="teachers" className="mt-4 space-y-3">
              {teachers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No teachers yet. Create one to get started.</p>
              ) : (
                teachers.map((teacher) => (
                  <div key={teacher.id} className="rounded-lg border p-3 flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-full">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{teacher.name}</p>
                      <p className="text-xs text-muted-foreground">{teacher.email}</p>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
            <TabsContent value="students" className="mt-4 space-y-3">
              {students.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No students yet. Create accounts for your students.</p>
              ) : (
                students.map((student) => (
                  <div key={student.id} className="rounded-lg border p-3 flex items-center gap-3">
                    <div className="p-2 bg-sky-100 text-sky-700 rounded-full">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.email}</p>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

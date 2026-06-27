import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft, ClipboardList, PlusCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AssignmentCard from '@/components/assignment/AssignmentCard';
import AssignmentForm from '@/components/assignment/AssignmentForm';
import SubmissionForm from '@/components/assignment/SubmissionForm';
import { assignmentsApi, classesApi } from '@/services/api';
import { useApp } from '@/contexts/AppContext';
import type { Assignment, Class } from '@/types';

export default function AssignmentsPage() {
  const navigate = useNavigate();
  const { state } = useApp();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [teacherClasses, setTeacherClasses] = useState<Class[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!state.currentUser) return;
    if (state.currentUser.role === 'teacher') {
      const [a, c] = await Promise.all([
        assignmentsApi.getByTeacher(state.currentUser.id),
        classesApi.getByTeacher(state.currentUser.id),
      ]);
      setAssignments(a);
      setTeacherClasses(c);
      if (c.length > 0) setSelectedClassId(c[0].id);
    } else if (state.currentUser.role === 'student') {
      // Get assignments for student's classes
      const studentClasses = await classesApi.getByStudent(state.currentUser.id);
      const allAssignments: Assignment[] = [];
      for (const c of studentClasses) {
        const a = await assignmentsApi.getByClass(c.id);
        allAssignments.push(...a);
      }
      setAssignments(allAssignments);
    }
  };

  const selectedClass = teacherClasses.find((c) => c.id === selectedClassId);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(`/${state.currentUser?.role}`)}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-100 text-sky-700 rounded-lg">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Assignments</h1>
            <p className="text-sm text-muted-foreground">
              {state.currentUser?.role === 'teacher' ? 'Create and manage assignments' : 'View and submit your work'}
            </p>
          </div>
        </div>
        {state.currentUser?.role === 'teacher' && (
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-700 hover:bg-emerald-800 text-white">
                <PlusCircle className="h-4 w-4 mr-1" /> Create
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Assignment</DialogTitle>
              </DialogHeader>
              {selectedClass && (
                <AssignmentForm
                  classId={selectedClass.id}
                  className={selectedClass.name}
                  onSuccess={() => { setShowCreate(false); loadData(); }}
                />
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>

      {state.currentUser?.role === 'teacher' && teacherClasses.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {teacherClasses.map((c) => (
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
      )}

      {assignments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border">
          <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">No assignments yet</p>
          <p className="text-sm text-muted-foreground">
            {state.currentUser?.role === 'teacher' ? 'Create your first assignment above.' : 'No assignments for your classes yet.'}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {assignments.map((a) => (
            <AssignmentCard
              key={a.id}
              assignment={a}
              onClick={() => {
                if (state.currentUser?.role === 'student') {
                  setSelectedAssignment(a);
                  setShowSubmit(true);
                }
              }}
            />
          ))}
        </div>
      )}

      {/* Submit Dialog for Students */}
      <Dialog open={showSubmit} onOpenChange={setShowSubmit}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submit Assignment</DialogTitle>
          </DialogHeader>
          {selectedAssignment && (
            <SubmissionForm
              assignment={selectedAssignment}
              onSuccess={() => { setShowSubmit(false); loadData(); }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

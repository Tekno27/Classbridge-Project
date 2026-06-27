import { useState } from 'react';
import { FileText, Calendar, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { assignmentsApi, activitiesApi } from '@/services/api';
import { useApp } from '@/contexts/AppContext';

interface AssignmentFormProps {
  classId: string;
  className: string;
  onSuccess?: () => void;
}

export default function AssignmentForm({ classId, className, onSuccess }: AssignmentFormProps) {
  const { state, dispatch } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [totalMarks, setTotalMarks] = useState('20');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !dueDate) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const assignment = await assignmentsApi.create({
        classId,
        className,
        teacherId: state.currentUser!.id,
        teacherName: state.currentUser!.name,
        title: title.trim(),
        description: description.trim(),
        totalMarks: parseInt(totalMarks) || 20,
        dueDate,
        attachments: selectedFiles,
      });
      dispatch({ type: 'ADD_ASSIGNMENT', payload: assignment });
      await activitiesApi.add({
        userId: state.currentUser!.id,
        userName: state.currentUser!.name,
        userRole: state.currentUser!.role,
        action: 'created assignment',
        target: assignment.title,
      });
      toast.success('Assignment created successfully!');
      setTitle('');
      setDescription('');
      setDueDate('');
      setTotalMarks('20');
      setSelectedFiles([]);
      onSuccess?.();
    } catch {
      toast.error('Failed to create assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-emerald-600" />
          Assignment Title
        </Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Photosynthesis Diagram"
          className="h-11"
        />
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the assignment..."
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label>Attachments (optional)</Label>
        <Input
          type="file"
          multiple
          onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
          className="h-11 pt-2"
        />
        {selectedFiles.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected: {selectedFiles.map((file) => file.name).join(', ')}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-emerald-600" />
            Due Date
          </Label>
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Star className="h-4 w-4 text-emerald-600" />
            Total Marks
          </Label>
          <Input
            type="number"
            value={totalMarks}
            onChange={(e) => setTotalMarks(e.target.value)}
            min={1}
            max={100}
            className="h-11"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-11 bg-emerald-700 hover:bg-emerald-800 text-white"
      >
        {isSubmitting ? 'Creating...' : 'Create Assignment'}
      </Button>
    </form>
  );
}

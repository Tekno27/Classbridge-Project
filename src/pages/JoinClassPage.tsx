import { useNavigate } from 'react-router';
import { ArrowLeft, PlusCircle, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import JoinClassForm from '@/components/class/JoinClassForm';

export default function JoinClassPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/student')}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>

      <div className="bg-white rounded-xl border p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg">
            <PlusCircle className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Join a Class</h1>
            <p className="text-sm text-muted-foreground">Enter the class code from your teacher.</p>
          </div>
        </div>

        <JoinClassForm onSuccess={() => navigate('/student/classes')} />
      </div>

      {/* Demo hint */}
      <div className="bg-sky-50 rounded-xl border border-sky-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-4 w-4 text-sky-700" />
          <span className="font-medium text-sm text-sky-800">Demo Tip</span>
        </div>
        <p className="text-sm text-sky-700">
          Try joining with this code: <strong className="font-mono">JHS2-SCI-4821</strong>
        </p>
      </div>
    </div>
  );
}

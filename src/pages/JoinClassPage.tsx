import { useNavigate } from 'react-router';
import { ArrowLeft, PlusCircle } from 'lucide-react';
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
    </div>
  );
}

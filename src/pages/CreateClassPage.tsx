import { useNavigate } from 'react-router';
import { ArrowLeft, BookOpen, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ClassForm from '@/components/class/ClassForm';
import { useApp } from '@/contexts/AppContext';
import { useState } from 'react';

export default function CreateClassPage() {
  const navigate = useNavigate();
  const { state } = useApp();
  const [createdClass, setCreatedClass] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const lastClass = state.classes[state.classes.length - 1];

  const copyCode = () => {
    if (lastClass) {
      navigator.clipboard.writeText(lastClass.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/teacher')}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
      </Button>

      <div className="bg-white rounded-xl border p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Create New Class</h1>
            <p className="text-sm text-muted-foreground">Set up a class for your students to join.</p>
          </div>
        </div>

        <ClassForm onSuccess={() => setCreatedClass('done')} />
      </div>

      {lastClass && createdClass && (
        <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4 sm:p-6">
          <h3 className="font-semibold text-emerald-800 mb-2">Class Created Successfully!</h3>
          <p className="text-sm text-emerald-700 mb-3">
            Share this code with your students so they can join:
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white rounded-lg px-4 py-3 text-center font-mono text-lg font-bold text-emerald-800 border border-emerald-200">
              {lastClass.code}
            </div>
            <Button onClick={copyCode} variant="outline" className="h-12">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

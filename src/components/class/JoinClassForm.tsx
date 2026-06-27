import { useState } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { classesApi, activitiesApi } from '@/services/api';
import { useApp } from '@/contexts/AppContext';

interface JoinClassFormProps {
  onSuccess?: () => void;
}

export default function JoinClassForm({ onSuccess }: JoinClassFormProps) {
  const { state, dispatch } = useApp();
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error('Please enter a class code');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await classesApi.join(code.trim().toUpperCase());
      if (result) {
        dispatch({ type: 'ADD_CLASS', payload: result });
        await activitiesApi.add({
          userId: state.currentUser!.id,
          userName: state.currentUser!.name,
          userRole: state.currentUser!.role,
          action: 'joined class',
          target: result.name,
        });
        toast.success(`Successfully joined ${result.name}!`);
        setCode('');
        onSuccess?.();
      } else {
        toast.error('Invalid class code or already joined');
      }
    } catch {
      toast.error('Failed to join class');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Search className="h-4 w-4 text-emerald-600" />
          Enter Class Code
        </label>
        <Input
          placeholder="e.g., CLASS-4821"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="h-12 text-center text-lg tracking-wider font-mono uppercase"
        />
        <p className="text-xs text-muted-foreground text-center">
          Ask your teacher for the class code
        </p>
      </div>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-11 bg-emerald-700 hover:bg-emerald-800 text-white"
      >
        {isSubmitting ? 'Joining...' : (
          <>
            Join Class <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}

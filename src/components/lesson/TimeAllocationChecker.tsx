import { useState, useCallback, useMemo } from 'react';
import { Plus, Trash2, Clock, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { TimeAllocation } from '@/types';

interface TimeAllocationCheckerProps {
  duration: number;
  allocations: TimeAllocation[];
  onChange: (allocations: TimeAllocation[]) => void;
}

interface TimeStatus {
  totalAllocated: number;
  remaining: number;
  isBalanced: boolean;
  isOver: boolean;
  percentage: number;
}

export default function TimeAllocationChecker({ duration, allocations, onChange }: TimeAllocationCheckerProps) {
  const [newActivity, setNewActivity] = useState('');
  const [newMinutes, setNewMinutes] = useState('');

  const addAllocation = useCallback(() => {
    const mins = parseInt(newMinutes);
    if (!newActivity.trim() || isNaN(mins) || mins <= 0) return;
    const allocation: TimeAllocation = {
      id: `ta-${Date.now()}`,
      activity: newActivity.trim(),
      minutes: mins,
    };
    onChange([...allocations, allocation]);
    setNewActivity('');
    setNewMinutes('');
  }, [newActivity, newMinutes, allocations, onChange]);

  const removeAllocation = useCallback((id: string) => {
    onChange(allocations.filter((a) => a.id !== id));
  }, [allocations, onChange]);

  const updateAllocation = useCallback((id: string, field: 'activity' | 'minutes', value: string | number) => {
    onChange(allocations.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  }, [allocations, onChange]);

  const status: TimeStatus = useMemo(() => {
    const totalAllocated = allocations.reduce((sum, a) => sum + a.minutes, 0);
    const remaining = duration - totalAllocated;
    return {
      totalAllocated,
      remaining,
      isBalanced: totalAllocated === duration && duration > 0,
      isOver: totalAllocated > duration,
      percentage: duration > 0 ? Math.min((totalAllocated / duration) * 100, 100) : 0,
    };
  }, [allocations, duration]);

  const getStatusColor = () => {
    if (status.isOver) return 'text-red-600 bg-red-50 border-red-200';
    if (status.isBalanced) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (status.remaining > 0) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getStatusIcon = () => {
    if (status.isOver) return <XCircle className="h-5 w-5 text-red-600" />;
    if (status.isBalanced) return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
    return <AlertTriangle className="h-5 w-5 text-amber-600" />;
  };

  const getStatusMessage = () => {
    if (status.isOver) return `You exceeded the lesson duration by ${Math.abs(status.remaining)} minutes.`;
    if (status.isBalanced) return 'Lesson time is perfectly balanced!';
    if (status.remaining > 0) return `You have ${status.remaining} minutes unallocated.`;
    return 'Add time allocations for each activity.';
  };

  const getBarColor = () => {
    if (status.isOver) return 'bg-red-500';
    if (status.isBalanced) return 'bg-emerald-500';
    return 'bg-amber-500';
  };

  return (
    <div className="space-y-4">
      {/* Status Header */}
      <div className={`rounded-xl border p-4 ${getStatusColor()}`}>
        <div className="flex items-start gap-3">
          {getStatusIcon()}
          <div className="flex-1">
            <p className="font-semibold text-sm">{getStatusMessage()}</p>
            <div className="mt-2 flex items-center gap-4 text-xs">
              <span>Total: <strong>{status.totalAllocated} min</strong></span>
              <span>Duration: <strong>{duration} min</strong></span>
              <span>Remaining: <strong>{status.remaining} min</strong></span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {duration > 0 && (
          <div className="mt-3">
            <div className="h-3 bg-white/60 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${getBarColor()}`}
                style={{ width: `${Math.min(status.percentage, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Allocations List */}
      {allocations.length > 0 && (
        <div className="space-y-2">
          {allocations.map((alloc) => (
            <div
              key={alloc.id}
              className="flex items-center gap-2 p-3 rounded-lg border bg-white group"
            >
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                value={alloc.activity}
                onChange={(e) => updateAllocation(alloc.id, 'activity', e.target.value)}
                className="h-8 text-sm flex-1"
                placeholder="Activity name"
              />
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  value={alloc.minutes}
                  onChange={(e) => updateAllocation(alloc.id, 'minutes', parseInt(e.target.value) || 0)}
                  className="h-8 w-16 text-sm text-center"
                  min={1}
                />
                <span className="text-xs text-muted-foreground w-8">min</span>
              </div>
              <button
                onClick={() => removeAllocation(alloc.id)}
                className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add New */}
      <div className="flex items-end gap-2 p-3 rounded-lg border bg-muted/30">
        <div className="flex-1">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Activity</label>
          <Input
            value={newActivity}
            onChange={(e) => setNewActivity(e.target.value)}
            placeholder="e.g., Introduction"
            className="h-9 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && addAllocation()}
          />
        </div>
        <div className="w-24">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Minutes</label>
          <Input
            type="number"
            value={newMinutes}
            onChange={(e) => setNewMinutes(e.target.value)}
            placeholder="5"
            className="h-9 text-sm text-center"
            min={1}
            onKeyDown={(e) => e.key === 'Enter' && addAllocation()}
          />
        </div>
        <Button
          type="button"
          onClick={addAllocation}
          size="sm"
          className="h-9 bg-emerald-700 hover:bg-emerald-800"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

import { formatDistanceToNow } from 'date-fns';
import {
  FileText, CheckCircle, Send, PlusCircle, UserPlus, Star, MessageCircle, BookOpen, RotateCcw
} from 'lucide-react';
import type { Activity } from '@/types';

interface ActivityTimelineProps {
  activities: Activity[];
  limit?: number;
}

const actionIcons: Record<string, React.ReactNode> = {
  'created lesson note': <FileText className="h-4 w-4" />,
  'submitted lesson note for review': <Send className="h-4 w-4" />,
  'approved lesson note': <CheckCircle className="h-4 w-4" />,
  'created class': <PlusCircle className="h-4 w-4" />,
  'joined class': <UserPlus className="h-4 w-4" />,
  'created assignment': <BookOpen className="h-4 w-4" />,
  'submitted assignment': <Send className="h-4 w-4" />,
  'graded submission': <Star className="h-4 w-4" />,
  'returned submission': <RotateCcw className="h-4 w-4" />,
  'asked question': <MessageCircle className="h-4 w-4" />,
};

const actionColors: Record<string, string> = {
  'created lesson note': 'bg-emerald-100 text-emerald-700',
  'submitted lesson note for review': 'bg-amber-100 text-amber-700',
  'approved lesson note': 'bg-emerald-100 text-emerald-700',
  'created class': 'bg-sky-100 text-sky-700',
  'joined class': 'bg-purple-100 text-purple-700',
  'created assignment': 'bg-blue-100 text-blue-700',
  'submitted assignment': 'bg-cyan-100 text-cyan-700',
  'graded submission': 'bg-amber-100 text-amber-700',
  'returned submission': 'bg-orange-100 text-orange-700',
  'asked question': 'bg-violet-100 text-violet-700',
};

export default function ActivityTimeline({ activities, limit = 8 }: ActivityTimelineProps) {
  const displayActivities = activities.slice(0, limit);

  if (displayActivities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayActivities.map((activity) => {
        const icon = actionIcons[activity.action] || <FileText className="h-4 w-4" />;
        const colorClass = actionColors[activity.action] || 'bg-gray-100 text-gray-600';
        return (
          <div key={activity.id} className="flex items-start gap-3 py-2">
            <div className={`p-2 rounded-full shrink-0 ${colorClass}`}>
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <span className="font-medium">{activity.userName}</span>{' '}
                <span className="text-muted-foreground">{activity.action}</span>{' '}
                <span className="font-medium text-emerald-700 truncate">{activity.target}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

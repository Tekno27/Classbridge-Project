import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { BellRing, ArrowLeft, CheckCheck, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { notificationsApi } from '@/services/api';
import type { Notification } from '@/types';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { state } = useApp();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const roleLabel = state.currentUser?.role === 'headteacher' ? 'Headteacher' : state.currentUser?.role === 'teacher' ? 'Teacher' : 'Student';

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const items = await notificationsApi.getAll();
        setNotifications(items);
      } catch {
        toast.error('Failed to load notifications');
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((items) => items.map((item) => ({ ...item, read: true })));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to update notifications');
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      const updated = await notificationsApi.markRead(id);
      setNotifications((items) => items.map((item) => (item.id === id ? updated : item)));
    } catch {
      toast.error('Failed to update notification');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700">{roleLabel} inbox</p>
          <h1 className="text-2xl font-semibold">Notifications</h1>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>

      <div className="rounded-2xl border bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-emerald-100 p-2 text-emerald-700">
              <BellRing className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">Your updates</p>
              <p className="text-sm text-muted-foreground">Stay on top of class activity and feedback.</p>
            </div>
          </div>
          {notifications.some((item) => !item.read) && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
              <CheckCheck className="mr-2 h-4 w-4" /> Mark all read
            </Button>
          )}
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notifications yet. Activity from your classes will appear here.</p>
        ) : (
          <div className="space-y-3">
            {notifications.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => !item.read && handleMarkRead(item.id)}
                className={`w-full text-left rounded-xl border p-4 transition-colors ${item.read ? 'bg-muted/40' : 'bg-emerald-50/50 border-emerald-200'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{item.title}</p>
                      {!item.read && (
                        <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                          New
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/60 p-4 sm:p-5">
        <div className="flex items-center gap-2 text-emerald-700">
          <Sparkles className="h-4 w-4" />
          <p className="font-medium">Activity reminders</p>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Notifications will keep you updated when lessons are reviewed, assignments are graded, or new class activity happens.
        </p>
        <Button className="mt-4" variant="outline" onClick={() => navigate('/settings')}>
          <CheckCheck className="mr-2 h-4 w-4" /> Manage reminders
        </Button>
      </div>
    </div>
  );
}

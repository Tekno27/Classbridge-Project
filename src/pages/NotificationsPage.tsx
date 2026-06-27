import { useNavigate } from 'react-router';
import { BellRing, ArrowLeft, CheckCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';

const baseNotifications = [
  {
    id: 'n1',
    title: 'New class invitation',
    detail: 'A new lesson plan has been shared with your class.',
    time: '10 min ago',
    unread: true,
  },
  {
    id: 'n2',
    title: 'Assignment feedback ready',
    detail: 'Your latest submission has been graded.',
    time: '1 hour ago',
    unread: true,
  },
  {
    id: 'n3',
    title: 'Lesson approved',
    detail: 'Your lesson note was approved by the headteacher.',
    time: 'Yesterday',
    unread: false,
  },
];

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { state } = useApp();
  const roleLabel = state.currentUser?.role === 'headteacher' ? 'Headteacher' : state.currentUser?.role === 'teacher' ? 'Teacher' : 'Student';

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
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-full bg-emerald-100 p-2 text-emerald-700">
            <BellRing className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold">Your updates</p>
            <p className="text-sm text-muted-foreground">Stay on top of class activity and feedback.</p>
          </div>
        </div>

        <div className="space-y-3">
          {baseNotifications.map((item) => (
            <div key={item.id} className={`rounded-xl border p-4 ${item.unread ? 'bg-emerald-50/50 border-emerald-200' : 'bg-muted/40'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{item.title}</p>
                    {item.unread && (
                      <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                        New
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                </div>
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
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

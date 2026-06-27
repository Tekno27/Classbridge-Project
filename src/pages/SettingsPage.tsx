import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Save, BellRing, ShieldCheck, UserCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useApp } from '@/contexts/AppContext';
import { usersApi } from '@/services/api';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [name, setName] = useState(state.currentUser?.name ?? '');
  const [email, setEmail] = useState(state.currentUser?.email ?? '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!state.currentUser) return;
    if (!name.trim() || !email.trim()) {
      toast.error('Name and email are required');
      return;
    }

    setIsSaving(true);
    try {
      const updated = await usersApi.updateProfile(state.currentUser.id, {
        name: name.trim(),
        email: email.trim(),
      });
      dispatch({ type: 'UPDATE_USER', payload: updated });
      toast.success('Settings updated');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update settings';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700">Account preferences</p>
          <h1 className="text-2xl font-semibold">Settings</h1>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>

      <div className="grid lg:grid-cols-[1.2fr,0.8fr] gap-6">
        <div className="rounded-2xl border bg-white p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="rounded-full bg-emerald-100 p-2 text-emerald-700">
              <UserCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">Profile</p>
              <p className="text-sm text-muted-foreground">Update your display information.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email address</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              <Save className="mr-2 h-4 w-4" /> {isSaving ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border bg-white p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3 text-emerald-700">
              <BellRing className="h-4 w-4" />
              <p className="font-semibold">Notifications</p>
            </div>
            <p className="text-sm text-muted-foreground">Choose how often you want reminders for lesson reviews, assignments and class updates.</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate('/notifications')}>Open notifications</Button>
          </div>

          <div className="rounded-2xl border bg-white p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3 text-emerald-700">
              <ShieldCheck className="h-4 w-4" />
              <p className="font-semibold">Security</p>
            </div>
            <p className="text-sm text-muted-foreground">Your account is protected with secure authentication and encrypted passwords.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

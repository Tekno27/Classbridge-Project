import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { GraduationCap, LogIn, User, Lock, ArrowRight, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { authApi } from '@/services/api';
import { useApp } from '@/contexts/AppContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const [needsSetup, setNeedsSetup] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(true);

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const status = await authApi.getSetupStatus();
        setNeedsSetup(status.needsHeadteacherSetup);
        setIsRegister(status.needsHeadteacherSetup);
      } catch {
        toast.error('Unable to reach the Classbridge server');
      } finally {
        setCheckingSetup(false);
      }
    };
    checkSetup();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    setIsLoading(true);
    try {
      const result = isRegister
        ? await authApi.register({ name: name.trim(), email: email.trim(), password })
        : await authApi.login(email.trim(), password);

      if (result?.user) {
        dispatch({ type: 'LOGIN', payload: result.user });
        toast.success(isRegister ? `Headteacher account created for ${result.user.name}` : `Welcome, ${result.user.name}!`);
        switch (result.user.role) {
          case 'teacher':
            navigate('/teacher');
            break;
          case 'student':
            navigate('/student');
            break;
          case 'headteacher':
            navigate('/headteacher');
            break;
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed';
      toast.error(message.includes('Failed to fetch')
        ? 'Unable to reach the Classbridge server. Make sure the backend is running on port 4000.'
        : message);
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingSetup) {
    return (
      <div className="w-full max-w-md text-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-xl border p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-emerald-50 rounded-xl mb-3">
            <GraduationCap className="h-8 w-8 text-emerald-700" />
          </div>
          <h1 className="text-2xl font-bold">
            {isRegister ? 'Set Up Your School' : 'Welcome Back'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isRegister
              ? 'Create the headteacher account to manage your school'
              : 'Log in with the account created by your headteacher'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-emerald-600" />
                Full Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="h-11"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4 text-emerald-600" />
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Lock className="h-4 w-4 text-emerald-600" />
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="h-11"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-emerald-700 hover:bg-emerald-800 text-white"
          >
            {isLoading ? (isRegister ? 'Creating account...' : 'Logging in...') : (
              <>
                {isRegister ? 'Create Headteacher Account' : 'Log In'} {isRegister ? <UserPlus className="ml-2 h-4 w-4" /> : <LogIn className="ml-2 h-4 w-4" />}
              </>
            )}
          </Button>
        </form>

        {!needsSetup && (
          <div className="mt-6 pt-6 border-t text-center">
            <p className="text-sm text-muted-foreground">
              Teachers and students cannot self-register. Contact your headteacher for an account.
            </p>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-muted-foreground hover:text-emerald-700 transition-colors inline-flex items-center gap-1"
          >
            <ArrowRight className="h-3 w-3 rotate-180" />
            Back to home
          </button>
        </div>
      </div>
    </div>
  );
}

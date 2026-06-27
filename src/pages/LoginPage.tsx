import { useState } from 'react';
import { useNavigate } from 'react-router';
import { GraduationCap, LogIn, User, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { authApi } from '@/services/api';
import { useApp } from '@/contexts/AppContext';

const demoAccounts = [
  { email: 'teacher@classbridge.test', role: 'Teacher', name: 'Mr. Kwame Asante', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { email: 'student@classbridge.test', role: 'Student', name: 'Ama Serwaa', color: 'bg-sky-50 text-sky-700 border-sky-200' },
  { email: 'headteacher@classbridge.test', role: 'Headteacher', name: 'Mrs. Abena Owusu', color: 'bg-amber-50 text-amber-700 border-amber-200' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    setIsLoading(true);
    try {
      const user = await authApi.login(email, password || 'password123');
      if (user) {
        dispatch({ type: 'LOGIN', payload: user });
        toast.success(`Welcome, ${user.name}!`);
        switch (user.role) {
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
      } else {
        toast.error('Invalid credentials. Try a demo account below.');
      }
    } catch {
      toast.error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const selectDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-xl border p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-emerald-50 rounded-xl mb-3">
            <GraduationCap className="h-8 w-8 text-emerald-700" />
          </div>
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Log in to access your dashboard
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
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
              placeholder="password123"
              className="h-11"
            />
            <p className="text-xs text-muted-foreground">
              Demo password for all accounts: <strong>password123</strong>
            </p>
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-emerald-700 hover:bg-emerald-800 text-white"
          >
            {isLoading ? 'Logging in...' : (
              <>
                Log In <LogIn className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {/* Demo Accounts */}
        <div className="mt-6 pt-6 border-t">
          <p className="text-xs font-medium text-muted-foreground mb-3 text-center uppercase tracking-wide">
            Quick Demo Access
          </p>
          <div className="space-y-2">
            {demoAccounts.map((demo) => (
              <button
                key={demo.email}
                onClick={() => selectDemo(demo.email)}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${demo.color} ${
                  email === demo.email ? 'ring-2 ring-emerald-400 ring-offset-1' : 'hover:shadow-sm'
                }`}
              >
                <div className="text-left">
                  <p className="text-sm font-semibold">{demo.name}</p>
                  <p className="text-xs opacity-80">{demo.email}</p>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/60">
                  {demo.role}
                </span>
              </button>
            ))}
          </div>
        </div>

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

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { GraduationCap, LogIn, User, Lock, ArrowRight, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { authApi } from '@/services/api';
import { useApp } from '@/contexts/AppContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function LoginPage() {
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'teacher' | 'student' | 'headteacher'>('student');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    setIsLoading(true);
    try {
      const user = isRegister
        ? await authApi.register({ name: name.trim(), email: email.trim(), password, role })
        : await authApi.login(email.trim(), password);

      if (user) {
        dispatch({ type: 'LOGIN', payload: user });
        toast.success(isRegister ? `Account created for ${user.name}` : `Welcome, ${user.name}!`);
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
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-xl border p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-emerald-50 rounded-xl mb-3">
            <GraduationCap className="h-8 w-8 text-emerald-700" />
          </div>
          <h1 className="text-2xl font-bold">{isRegister ? 'Create your account' : 'Welcome Back'}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isRegister ? 'Sign up to start using Classbridge' : 'Log in to access your dashboard'}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
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
              placeholder="password123"
              className="h-11"
            />
            {isRegister && (
              <div className="space-y-2 mt-2">
                <label className="text-sm font-medium">Role</label>
                <Select value={role} onValueChange={(value) => setRole(value as 'teacher' | 'student' | 'headteacher')}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="headteacher">Headteacher</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-emerald-700 hover:bg-emerald-800 text-white"
          >
            {isLoading ? (isRegister ? 'Creating account...' : 'Logging in...') : (
              <>
                {isRegister ? 'Create Account' : 'Log In'} {isRegister ? <UserPlus className="ml-2 h-4 w-4" /> : <LogIn className="ml-2 h-4 w-4" />}
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t text-center">
          <button
            onClick={() => setIsRegister((value) => !value)}
            className="text-sm text-emerald-700 hover:text-emerald-800 font-medium"
          >
            {isRegister ? 'Already have an account? Log in' : 'Need an account? Sign up'}
          </button>
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

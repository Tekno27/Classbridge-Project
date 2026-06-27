import { useNavigate } from 'react-router';
import {
  GraduationCap, ArrowRight, BookOpen, Users, ClipboardList, CheckCircle,
  Clock, MessageCircle, Shield, Zap, Globe, Star, Menu, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: 'Structured Lesson Notes',
      description: 'Teachers create detailed lesson plans with learning objectives, activities, and assessments.',
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: 'Time Allocation Checker',
      description: 'Smart tool ensures lesson activities fit perfectly within class duration.',
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: 'Headteacher Review',
      description: 'School leaders review, approve, or request corrections on lesson plans.',
    },
    {
      icon: <ClipboardList className="h-6 w-6" />,
      title: 'Assignment System',
      description: 'Create, submit, grade, and provide feedback on assignments seamlessly.',
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: 'Q&A Discussions',
      description: 'Students ask questions and teachers reply — fostering better understanding.',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Offline Drafts',
      description: 'Save lesson drafts locally and submit when ready. No data loss.',
    },
  ];

  const roles = [
    {
      icon: <Users className="h-8 w-8" />,
      role: 'Teachers',
      color: 'bg-emerald-50 text-emerald-700',
      actions: ['Create structured lesson notes', 'Track time allocations', 'Create & grade assignments', 'Reply to student questions'],
    },
    {
      icon: <GraduationCap className="h-8 w-8" />,
      role: 'Students',
      color: 'bg-sky-50 text-sky-700',
      actions: ['Join classes with a code', 'View approved lessons', 'Submit assignments', 'Ask & discuss questions'],
    },
    {
      icon: <Shield className="h-8 w-8" />,
      role: 'Headteachers',
      color: 'bg-amber-50 text-amber-700',
      actions: ['Review lesson notes', 'Approve or request corrections', 'Monitor school activity', 'Ensure teaching quality'],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-700 rounded-lg">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-emerald-800">ClassBridge Ghana</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#roles" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">For Schools</a>
            <a href="#demo" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Demo</a>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="hidden sm:inline-flex"
              onClick={() => navigate('/login')}
            >
              Log In
            </Button>
            <Button
              className="bg-emerald-700 hover:bg-emerald-800 text-white"
              onClick={() => navigate('/login')}
            >
              Try Demo
            </Button>
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border px-4 py-3 space-y-2">
            <a href="#features" className="block py-2 text-sm font-medium">Features</a>
            <a href="#roles" className="block py-2 text-sm font-medium">For Schools</a>
            <a href="#demo" className="block py-2 text-sm font-medium">Demo</a>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-sky-50 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                <Zap className="h-4 w-4" />
                Built for Ghanaian Public Schools
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                Bridging Ghanaian Classrooms Through{' '}
                <span className="text-emerald-700">Better School Workflows</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Helping teachers plan better lessons, helping headteachers monitor quality, 
                and helping students learn effectively. A mobile-first platform designed for 
                real public school environments.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white h-12 px-6"
                  onClick={() => navigate('/login')}
                >
                  Try the Demo <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-6"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Explore Features
                </Button>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                <span className="flex items-center gap-1"><Globe className="h-4 w-4" /> Mobile-First</span>
                <span className="flex items-center gap-1"><Zap className="h-4 w-4" /> Low-Data Friendly</span>
                <span className="flex items-center gap-1"><Star className="h-4 w-4" /> Easy to Use</span>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 pt-8">
                  <div className="bg-white rounded-2xl p-5 shadow-lg border border-emerald-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <BookOpen className="h-5 w-5 text-emerald-700" />
                      </div>
                      <span className="font-semibold text-sm">Lesson Notes</span>
                    </div>
                    <div className="h-2 bg-emerald-100 rounded-full mb-2">
                      <div className="h-2 bg-emerald-500 rounded-full w-3/4" />
                    </div>
                    <p className="text-xs text-muted-foreground">Structured & ready</p>
                  </div>
                  <div className="bg-white rounded-2xl p-5 shadow-lg border border-sky-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-sky-100 rounded-lg">
                        <Clock className="h-5 w-5 text-sky-700" />
                      </div>
                      <span className="font-semibold text-sm">Time Checker</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                      <CheckCircle className="h-3 w-3" /> Balanced
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl p-5 shadow-lg border border-amber-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-amber-700" />
                      </div>
                      <span className="font-semibold text-sm">Approved</span>
                    </div>
                    <p className="text-xs text-muted-foreground">By Headteacher</p>
                  </div>
                  <div className="bg-white rounded-2xl p-5 shadow-lg border border-violet-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-violet-100 rounded-lg">
                        <MessageCircle className="h-5 w-5 text-violet-700" />
                      </div>
                      <span className="font-semibold text-sm">Q&A Thread</span>
                    </div>
                    <p className="text-xs text-muted-foreground">3 replies</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-red-50 rounded-2xl p-6 sm:p-8 border border-red-100">
              <h3 className="text-red-800 font-semibold mb-4 flex items-center gap-2">
                <X className="h-5 w-5" /> The Problem
              </h3>
              <ul className="space-y-3">
                {[
                  'Teachers write lesson notes in paper books that get lost or damaged',
                  'Headteachers cannot easily review teaching quality across classes',
                  'Students miss lessons and have no way to catch up',
                  'No structured way to give feedback on assignments',
                  'Lesson timing is often unbalanced — too short or too long',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                    <span className="mt-1.5 h-1.5 w-1.5 bg-red-400 rounded-full shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-emerald-50 rounded-2xl p-6 sm:p-8 border border-emerald-100">
              <h3 className="text-emerald-800 font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" /> The Solution
              </h3>
              <ul className="space-y-3">
                {[
                  'Digital lesson notes — structured, saved, and always accessible',
                  'Headteacher review workflow with approve/correct actions',
                  'Students access approved lessons and learning materials anytime',
                  'Complete assignment cycle: create → submit → grade → feedback',
                  'Smart time allocation checker ensures balanced lesson plans',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-emerald-700">
                    <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Built for Real Classrooms</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every feature designed with Ghanaian public school realities in mind.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border hover:shadow-md transition-shadow">
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg w-fit mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Three Roles, One Platform</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Each user sees exactly what they need.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {roles.map((r, i) => (
              <div key={i} className="rounded-xl border bg-white p-6">
                <div className={`p-3 rounded-lg w-fit mb-4 ${r.color}`}>
                  {r.icon}
                </div>
                <h3 className="text-lg font-semibold mb-4">{r.role}</h3>
                <ul className="space-y-2">
                  {r.actions.map((action, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="demo" className="py-16 bg-gradient-to-br from-emerald-700 to-emerald-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to Bridge Your Classroom?
          </h2>
          <p className="text-emerald-100 mb-8">
            Experience the full demo with pre-configured accounts for teachers, students, and headteachers.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="h-12 px-8 bg-white text-emerald-800 hover:bg-emerald-50"
            onClick={() => navigate('/login')}
          >
            Start Demo <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <div className="mt-6 text-sm text-emerald-200">
            Demo accounts: teacher@classbridge.test / student@classbridge.test / headteacher@classbridge.test
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <GraduationCap className="h-5 w-5 text-emerald-700" />
            <span className="font-semibold">ClassBridge Ghana</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Bridging Classrooms Through Better School Workflows
          </p>
        </div>
      </footer>
    </div>
  );
}

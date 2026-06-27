import type {
  User, Class, LessonNote, Assignment, Submission, Question, Activity, Reply,
} from '@/types';
import {
  mockUsers, mockClasses, mockLessons, mockAssignments, mockSubmissions,
  mockQuestions, mockActivities,
} from './mockData';

// Simulated delay for realism
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// In-memory storage (mutable for demo)
let classes = [...mockClasses];
let lessons = [...mockLessons];
let assignments = [...mockAssignments];
let submissions = [...mockSubmissions];
let questions = [...mockQuestions];
let activities = [...mockActivities];

// Auth API
export const authApi = {
  login: async (email: string, _password: string): Promise<User | null> => {
    await delay(600);
    const user = mockUsers.find((u) => u.email === email);
    return user || null;
  },

  getMe: async (userId: string): Promise<User | null> => {
    await delay(300);
    const user = mockUsers.find((u) => u.id === userId);
    return user || null;
  },
};

// Classes API
export const classesApi = {
  getAll: async (): Promise<Class[]> => {
    await delay(400);
    return [...classes];
  },

  getByTeacher: async (teacherId: string): Promise<Class[]> => {
    await delay(400);
    return classes.filter((c) => c.teacherId === teacherId);
  },

  getByStudent: async (studentId: string): Promise<Class[]> => {
    await delay(400);
    return classes.filter((c) => c.students.includes(studentId));
  },

  getById: async (id: string): Promise<Class | null> => {
    await delay(300);
    return classes.find((c) => c.id === id) || null;
  },

  create: async (data: Omit<Class, 'id' | 'code' | 'students' | 'createdAt'>): Promise<Class> => {
    await delay(600);
    const newClass: Class = {
      ...data,
      id: `c${Date.now()}`,
      code: generateClassCode(data.level, data.subject),
      students: [],
      createdAt: new Date().toISOString(),
    };
    classes = [...classes, newClass];
    return newClass;
  },

  join: async (code: string, studentId: string): Promise<Class | null> => {
    await delay(500);
    const classIndex = classes.findIndex((c) => c.code === code);
    if (classIndex === -1) return null;
    if (classes[classIndex].students.includes(studentId)) return null;
    const updated = {
      ...classes[classIndex],
      students: [...classes[classIndex].students, studentId],
    };
    classes = classes.map((c, i) => (i === classIndex ? updated : c));
    return updated;
  },
};

function generateClassCode(level: string, subject: string): string {
  const levelPrefix = level.replace(/\s/g, '').toUpperCase();
  const subjPrefix = subject.split(' ').map((w) => w[0]).join('').toUpperCase();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${levelPrefix}-${subjPrefix}-${random}`;
}

// Lessons API
export const lessonsApi = {
  getAll: async (): Promise<LessonNote[]> => {
    await delay(400);
    return [...lessons];
  },

  getByTeacher: async (teacherId: string): Promise<LessonNote[]> => {
    await delay(400);
    return lessons.filter((l) => l.teacherId === teacherId);
  },

  getByClass: async (classId: string): Promise<LessonNote[]> => {
    await delay(400);
    return lessons.filter((l) => l.classId === classId && l.status === 'approved');
  },

  getById: async (id: string): Promise<LessonNote | null> => {
    await delay(300);
    return lessons.find((l) => l.id === id) || null;
  },

  getPendingReview: async (): Promise<LessonNote[]> => {
    await delay(400);
    return lessons.filter((l) => l.status === 'submitted');
  },

  getByStatus: async (status: string): Promise<LessonNote[]> => {
    await delay(400);
    return lessons.filter((l) => l.status === status);
  },

  create: async (data: Omit<LessonNote, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<LessonNote> => {
    await delay(600);
    const newLesson: LessonNote = {
      ...data,
      id: `l${Date.now()}`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    lessons = [...lessons, newLesson];
    return newLesson;
  },

  update: async (id: string, data: Partial<LessonNote>): Promise<LessonNote | null> => {
    await delay(500);
    const index = lessons.findIndex((l) => l.id === id);
    if (index === -1) return null;
    const updated = { ...lessons[index], ...data, updatedAt: new Date().toISOString() };
    lessons = lessons.map((l, i) => (i === index ? updated : l));
    return updated;
  },

  submit: async (id: string): Promise<LessonNote | null> => {
    await delay(500);
    const index = lessons.findIndex((l) => l.id === id);
    if (index === -1) return null;
    const updated = { ...lessons[index], status: 'submitted' as const, updatedAt: new Date().toISOString() };
    lessons = lessons.map((l, i) => (i === index ? updated : l));
    return updated;
  },

  approve: async (id: string, comment?: string): Promise<LessonNote | null> => {
    await delay(500);
    const index = lessons.findIndex((l) => l.id === id);
    if (index === -1) return null;
    const updated = {
      ...lessons[index],
      status: 'approved' as const,
      headteacherComment: comment || 'Approved.',
      updatedAt: new Date().toISOString(),
    };
    lessons = lessons.map((l, i) => (i === index ? updated : l));
    return updated;
  },

  requestCorrection: async (id: string, comment: string): Promise<LessonNote | null> => {
    await delay(500);
    const index = lessons.findIndex((l) => l.id === id);
    if (index === -1) return null;
    const updated = {
      ...lessons[index],
      status: 'correction_requested' as const,
      headteacherComment: comment,
      updatedAt: new Date().toISOString(),
    };
    lessons = lessons.map((l, i) => (i === index ? updated : l));
    return updated;
  },
};

// Assignments API
export const assignmentsApi = {
  getAll: async (): Promise<Assignment[]> => {
    await delay(400);
    return [...assignments];
  },

  getByTeacher: async (teacherId: string): Promise<Assignment[]> => {
    await delay(400);
    return assignments.filter((a) => a.teacherId === teacherId);
  },

  getByClass: async (classId: string): Promise<Assignment[]> => {
    await delay(400);
    return assignments.filter((a) => a.classId === classId);
  },

  getById: async (id: string): Promise<Assignment | null> => {
    await delay(300);
    return assignments.find((a) => a.id === id) || null;
  },

  create: async (data: Omit<Assignment, 'id' | 'createdAt'>): Promise<Assignment> => {
    await delay(600);
    const newAssignment: Assignment = {
      ...data,
      id: `a${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    assignments = [...assignments, newAssignment];
    return newAssignment;
  },
};

// Submissions API
export const submissionsApi = {
  getAll: async (): Promise<Submission[]> => {
    await delay(400);
    return [...submissions];
  },

  getByStudent: async (studentId: string): Promise<Submission[]> => {
    await delay(400);
    return submissions.filter((s) => s.studentId === studentId);
  },

  getByAssignment: async (assignmentId: string): Promise<Submission[]> => {
    await delay(400);
    return submissions.filter((s) => s.assignmentId === assignmentId);
  },

  getByTeacher: async (teacherId: string): Promise<Submission[]> => {
    await delay(400);
    const teacherAssignments = assignments.filter((a) => a.teacherId === teacherId);
    const assignmentIds = teacherAssignments.map((a) => a.id);
    return submissions.filter((s) => assignmentIds.includes(s.assignmentId));
  },

  submit: async (data: Omit<Submission, 'id' | 'status' | 'submittedAt'>): Promise<Submission> => {
    await delay(600);
    // Update existing or create new
    const existingIndex = submissions.findIndex(
      (s) => s.assignmentId === data.assignmentId && s.studentId === data.studentId
    );
    if (existingIndex >= 0) {
      const updated = {
        ...submissions[existingIndex],
        answer: data.answer,
        status: 'submitted' as const,
        submittedAt: new Date().toISOString(),
      };
      submissions = submissions.map((s, i) => (i === existingIndex ? updated : s));
      return updated;
    }
    const newSubmission: Submission = {
      ...data,
      id: `s${Date.now()}`,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
    };
    submissions = [...submissions, newSubmission];
    return newSubmission;
  },

  grade: async (id: string, score: number, feedback: string): Promise<Submission | null> => {
    await delay(500);
    const index = submissions.findIndex((s) => s.id === id);
    if (index === -1) return null;
    const updated = {
      ...submissions[index],
      score,
      feedback,
      status: 'graded' as const,
    };
    submissions = submissions.map((s, i) => (i === index ? updated : s));
    return updated;
  },
};

// Questions API
export const questionsApi = {
  getByLesson: async (lessonId: string): Promise<Question[]> => {
    await delay(400);
    return questions.filter((q) => q.lessonId === lessonId);
  },

  ask: async (data: Omit<Question, 'id' | 'replies' | 'createdAt'>): Promise<Question> => {
    await delay(500);
    const newQuestion: Question = {
      ...data,
      id: `q${Date.now()}`,
      replies: [],
      createdAt: new Date().toISOString(),
    };
    questions = [...questions, newQuestion];
    return newQuestion;
  },

  reply: async (questionId: string, reply: Omit<Reply, 'id' | 'createdAt'>): Promise<Question | null> => {
    await delay(500);
    const index = questions.findIndex((q) => q.id === questionId);
    if (index === -1) return null;
    const newReply = {
      ...reply,
      id: `r${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = {
      ...questions[index],
      replies: [...questions[index].replies, newReply],
    };
    questions = questions.map((q, i) => (i === index ? updated : q));
    return updated;
  },
};

// Activities API
export const activitiesApi = {
  getAll: async (): Promise<Activity[]> => {
    await delay(300);
    return [...activities].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  add: async (data: Omit<Activity, 'id' | 'timestamp'>): Promise<Activity> => {
    await delay(300);
    const newActivity: Activity = {
      ...data,
      id: `act${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    activities = [newActivity, ...activities];
    return newActivity;
  },
};

// Stats API
export const statsApi = {
  getTeacherStats: async (teacherId: string) => {
    await delay(400);
    const teacherClasses = classes.filter((c) => c.teacherId === teacherId);
    const teacherLessons = lessons.filter((l) => l.teacherId === teacherId);
    const teacherAssignments = assignments.filter((a) => a.teacherId === teacherId);
    const assignmentIds = teacherAssignments.map((a) => a.id);
    const teacherSubmissions = submissions.filter((s) => assignmentIds.includes(s.assignmentId));

    return {
      totalClasses: teacherClasses.length,
      pendingLessons: teacherLessons.filter((l) => l.status === 'draft' || l.status === 'correction_requested').length,
      approvedLessons: teacherLessons.filter((l) => l.status === 'approved').length,
      totalAssignments: teacherAssignments.length,
      totalSubmissions: teacherSubmissions.filter((s) => s.status === 'submitted' || s.status === 'graded').length,
    };
  },

  getHeadteacherStats: async () => {
    await delay(400);
    return {
      pendingReviews: lessons.filter((l) => l.status === 'submitted').length,
      approvedLessons: lessons.filter((l) => l.status === 'approved').length,
      correctionsRequested: lessons.filter((l) => l.status === 'correction_requested').length,
      totalClasses: classes.length,
      totalTeachers: new Set(classes.map((c) => c.teacherId)).size,
      totalStudents: new Set(classes.flatMap((c) => c.students)).size,
    };
  },

  getStudentStats: async (studentId: string) => {
    await delay(400);
    const studentClasses = classes.filter((c) => c.students.includes(studentId));
    const classIds = studentClasses.map((c) => c.id);
    const availableLessons = lessons.filter((l) => classIds.includes(l.classId) && l.status === 'approved');
    const studentAssignments = assignments.filter((a) => classIds.includes(a.classId));
    const studentSubmissions = submissions.filter((s) => s.studentId === studentId);

    return {
      joinedClasses: studentClasses.length,
      availableLessons: availableLessons.length,
      pendingAssignments: studentAssignments.length - studentSubmissions.filter((s) => s.status === 'submitted' || s.status === 'graded').length,
      submittedWork: studentSubmissions.filter((s) => s.status === 'submitted' || s.status === 'graded').length,
      feedbackReceived: studentSubmissions.filter((s) => s.status === 'graded').length,
    };
  },
};

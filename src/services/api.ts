import type {
  User, Class, LessonNote, Assignment, Submission, Question, Activity, Reply,
  Notification, TeacherSummary, AuthResponse, SetupStatus, CreateUserPayload, CreateClassPayload,
} from '@/types';

const API_BASE = '/api';

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('cb_token', token);
    } else {
      localStorage.removeItem('cb_token');
    }
  }
}

export function getAuthToken(): string | null {
  if (!authToken && typeof window !== 'undefined') {
    authToken = localStorage.getItem('cb_token');
  }
  return authToken;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  const isFormData = init?.body instanceof FormData;
  const token = getAuthToken();

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    let message = `Request failed: ${response.status}`;
    try {
      message = errorText ? JSON.parse(errorText).error || errorText : message;
    } catch {
      message = errorText || message;
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

// Auth API
export const authApi = {
  getSetupStatus: async (): Promise<SetupStatus> => request<SetupStatus>('/auth/setup-status'),

  login: async (email: string, password: string): Promise<AuthResponse | null> => {
    const result = await request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (result?.token) {
      setAuthToken(result.token);
    }
    return result || null;
  },

  register: async (data: { name: string; email: string; password: string }): Promise<AuthResponse | null> => {
    const result = await request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ ...data, role: 'headteacher' }),
    });
    if (result?.token) {
      setAuthToken(result.token);
    }
    return result || null;
  },

  getMe: async (): Promise<User | null> => {
    try {
      return await request<User>('/auth/me');
    } catch {
      return null;
    }
  },

  logout: () => {
    setAuthToken(null);
  },
};

// Users API
export const usersApi = {
  updateProfile: async (userId: string, data: { name: string; email: string }): Promise<User> => {
    return request<User>(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  getTeachers: async (): Promise<TeacherSummary[]> => request<TeacherSummary[]>('/users/teachers'),

  getStudents: async (): Promise<User[]> => request<User[]>('/users/students'),

  createUser: async (data: CreateUserPayload): Promise<User> => request<User>('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// Notifications API
export const notificationsApi = {
  getAll: async (): Promise<Notification[]> => request<Notification[]>('/notifications'),

  markRead: async (id: string): Promise<Notification> => request<Notification>(`/notifications/${id}/read`, {
    method: 'PATCH',
  }),

  markAllRead: async (): Promise<{ success: boolean }> => request<{ success: boolean }>('/notifications/read-all', {
    method: 'PATCH',
  }),
};

// Classes API
export const classesApi = {
  getAll: async (): Promise<Class[]> => {
    const response = await request<Class[]>('/classes');
    return [...response];
  },

  getByTeacher: async (teacherId: string): Promise<Class[]> => {
    const response = await request<Class[]>('/classes');
    return response.filter((c) => c.teacherId === teacherId);
  },

  getByStudent: async (studentId: string): Promise<Class[]> => {
    const response = await request<Class[]>('/classes');
    return response.filter((c) => c.students.includes(studentId));
  },

  getById: async (id: string): Promise<Class | null> => {
    const response = await request<Class[]>('/classes');
    return response.find((c) => c.id === id) || null;
  },

  create: async (data: CreateClassPayload): Promise<Class> => {
    return request<Class>('/classes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: { teacherId?: string; studentIds?: string[] }): Promise<Class> => {
    return request<Class>(`/classes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  join: async (code: string): Promise<Class | null> => {
    return request<Class | null>(`/classes/join?code=${encodeURIComponent(code)}`, {
      method: 'POST',
    });
  },
};

// Lessons API
export const lessonsApi = {
  getAll: async (): Promise<LessonNote[]> => request<LessonNote[]>('/lessons'),

  getByTeacher: async (teacherId: string): Promise<LessonNote[]> => {
    const lessonsList = await request<LessonNote[]>('/lessons');
    return lessonsList.filter((l) => l.teacherId === teacherId);
  },

  getByClass: async (classId: string): Promise<LessonNote[]> => {
    const lessonsList = await request<LessonNote[]>('/lessons');
    return lessonsList.filter((l) => l.classId === classId && l.status === 'approved');
  },

  getById: async (id: string): Promise<LessonNote | null> => {
    const lessonsList = await request<LessonNote[]>('/lessons');
    return lessonsList.find((l) => l.id === id) || null;
  },

  getPendingReview: async (): Promise<LessonNote[]> => {
    const lessonsList = await request<LessonNote[]>('/lessons');
    return lessonsList.filter((l) => l.status === 'submitted');
  },

  getByStatus: async (status: string): Promise<LessonNote[]> => {
    const lessonsList = await request<LessonNote[]>('/lessons');
    return lessonsList.filter((l) => l.status === status);
  },

  create: async (data: Omit<LessonNote, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<LessonNote> => request<LessonNote>('/lessons', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: async (id: string, data: Partial<LessonNote>): Promise<LessonNote | null> => request<LessonNote>(`/lessons/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),

  submit: async (id: string): Promise<LessonNote | null> => request<LessonNote>(`/lessons/${id}/submit`, {
    method: 'POST',
  }),

  approve: async (id: string, comment?: string): Promise<LessonNote | null> => request<LessonNote>(`/lessons/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ comment }),
  }),

  requestCorrection: async (id: string, comment: string): Promise<LessonNote | null> => request<LessonNote>(`/lessons/${id}/correction`, {
    method: 'POST',
    body: JSON.stringify({ comment }),
  }),
};

type AssignmentCreatePayload = Omit<Assignment, 'id' | 'createdAt' | 'attachments'> & { attachments?: File[] };
type SubmissionCreatePayload = Omit<Submission, 'id' | 'status' | 'submittedAt' | 'attachments'> & { attachments?: File[] };

// Assignments API
export const assignmentsApi = {
  getAll: async (): Promise<Assignment[]> => request<Assignment[]>('/assignments'),

  getByTeacher: async (teacherId: string): Promise<Assignment[]> => {
    const assignmentsList = await request<Assignment[]>('/assignments');
    return assignmentsList.filter((a) => a.teacherId === teacherId);
  },

  getByClass: async (classId: string): Promise<Assignment[]> => {
    const assignmentsList = await request<Assignment[]>('/assignments');
    return assignmentsList.filter((a) => a.classId === classId);
  },

  getById: async (id: string): Promise<Assignment | null> => {
    const assignmentsList = await request<Assignment[]>('/assignments');
    return assignmentsList.find((a) => a.id === id) || null;
  },

  create: async (data: AssignmentCreatePayload): Promise<Assignment> => {
    const { attachments, ...payload } = data;

    if (attachments?.length) {
      const formData = new FormData();
      const attachmentFiles = attachments as File[];
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, String(value));
        }
      });
      attachmentFiles.forEach((file) => formData.append('attachments', file));

      return request<Assignment>('/assignments', {
        method: 'POST',
        body: formData,
      });
    }

    return request<Assignment>('/assignments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

// Submissions API
export const submissionsApi = {
  getAll: async (): Promise<Submission[]> => request<Submission[]>('/submissions'),

  getByStudent: async (studentId: string): Promise<Submission[]> => {
    const submissionsList = await request<Submission[]>('/submissions');
    return submissionsList.filter((s) => s.studentId === studentId);
  },

  getByAssignment: async (assignmentId: string): Promise<Submission[]> => {
    const submissionsList = await request<Submission[]>('/submissions');
    return submissionsList.filter((s) => s.assignmentId === assignmentId);
  },

  getByTeacher: async (teacherId: string): Promise<Submission[]> => {
    const assignmentsList = await request<Assignment[]>('/assignments');
    const teacherAssignments = assignmentsList.filter((a) => a.teacherId === teacherId);
    const assignmentIds = teacherAssignments.map((a) => a.id);
    const submissionsList = await request<Submission[]>('/submissions');
    return submissionsList.filter((s) => assignmentIds.includes(s.assignmentId));
  },

  submit: async (data: SubmissionCreatePayload): Promise<Submission> => {
    const { attachments, ...payload } = data;

    if (attachments?.length) {
      const formData = new FormData();
      const attachmentFiles = attachments as File[];
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, String(value));
        }
      });
      attachmentFiles.forEach((file) => formData.append('attachments', file));

      return request<Submission>('/submissions', {
        method: 'POST',
        body: formData,
      });
    }

    return request<Submission>('/submissions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  grade: async (id: string, score: number, feedback: string): Promise<Submission | null> => request<Submission>(`/submissions/${id}/grade`, {
    method: 'PATCH',
    body: JSON.stringify({ score, feedback }),
  }),

  returnForRevision: async (id: string, feedback: string): Promise<Submission | null> => request<Submission>(`/submissions/${id}/return`, {
    method: 'POST',
    body: JSON.stringify({ feedback }),
  }),
};

// Questions API
export const questionsApi = {
  getByLesson: async (lessonId: string): Promise<Question[]> => {
    const questionsList = await request<Question[]>('/questions');
    return questionsList.filter((q) => q.lessonId === lessonId);
  },

  ask: async (data: Omit<Question, 'id' | 'replies' | 'createdAt'>): Promise<Question> => request<Question>('/questions', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  reply: async (questionId: string, reply: Omit<Reply, 'id' | 'createdAt'>): Promise<Question | null> => request<Question>(`/questions/${questionId}/replies`, {
    method: 'POST',
    body: JSON.stringify(reply),
  }),
};

// Activities API
export const activitiesApi = {
  getAll: async (): Promise<Activity[]> => {
    const activitiesList = await request<Activity[]>('/activities');
    return [...activitiesList].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  add: async (data: Omit<Activity, 'id' | 'timestamp'>): Promise<Activity> => request<Activity>('/activities', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// Stats API
export const statsApi = {
  getTeacherStats: async (teacherId: string) => request<{
    totalClasses: number;
    pendingLessons: number;
    approvedLessons: number;
    totalAssignments: number;
    totalSubmissions: number;
  }>(`/stats/teacher/${teacherId}`),

  getHeadteacherStats: async () => request<{
    pendingReviews: number;
    approvedLessons: number;
    correctionsRequested: number;
    totalClasses: number;
    totalTeachers: number;
    totalStudents: number;
  }>('/stats/headteacher'),

  getStudentStats: async (studentId: string) => request<{
    joinedClasses: number;
    availableLessons: number;
    pendingAssignments: number;
    submittedWork: number;
    feedbackReceived: number;
  }>(`/stats/student/${studentId}`),
};

export function getUploadUrl(storedName: string): string {
  return `${API_BASE}/uploads/${storedName}`;
}

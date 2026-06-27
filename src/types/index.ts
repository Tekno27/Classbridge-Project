export type UserRole = 'teacher' | 'student' | 'headteacher';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export type LessonStatus = 'draft' | 'submitted' | 'approved' | 'correction_requested';
export type SubmissionStatus = 'pending' | 'submitted' | 'graded' | 'returned';

export interface Class {
  id: string;
  name: string;
  subject: string;
  level: string;
  term: string;
  code: string;
  teacherId: string;
  teacherName: string;
  students: string[];
  createdAt: string;
}

export interface LessonNote {
  id: string;
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  week: number;
  date: string;
  topic: string;
  subTopic: string;
  duration: number;
  learningObjectives: string;
  previousKnowledge: string;
  teachingMaterials: string;
  introduction: string;
  teacherActivities: string;
  learnerActivities: string;
  assessment: string;
  closure: string;
  remarks: string;
  timeAllocations: TimeAllocation[];
  status: LessonStatus;
  headteacherComment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimeAllocation {
  id: string;
  activity: string;
  minutes: number;
}

export interface AssignmentAttachment {
  name: string;
  type: string;
  size: number;
}

export interface Assignment {
  id: string;
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  title: string;
  description: string;
  totalMarks: number;
  dueDate: string;
  createdAt: string;
  attachments?: AssignmentAttachment[];
}

export interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  classId: string;
  answer: string;
  score?: number;
  feedback?: string;
  status: SubmissionStatus;
  submittedAt: string;
  attachments?: AssignmentAttachment[];
}

export interface Question {
  id: string;
  lessonId: string;
  lessonTopic: string;
  studentId: string;
  studentName: string;
  question: string;
  replies: Reply[];
  createdAt: string;
}

export interface Reply {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  message: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  target: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  detail: string;
  read: boolean;
  createdAt: string;
}

export interface TeacherSummary extends User {
  lessonCount: number;
  approvedLessonCount: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface SetupStatus {
  needsHeadteacherSetup: boolean;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: 'teacher' | 'student';
}

export interface CreateClassPayload {
  name: string;
  subject: string;
  level: string;
  term: string;
  teacherId: string;
  studentIds?: string[];
}

export interface OfflineDraft {
  lessonData: Partial<LessonNote>;
  timeAllocations: TimeAllocation[];
  savedAt: string;
}

export interface DashboardStats {
  totalClasses: number;
  pendingLessons: number;
  approvedLessons: number;
  totalAssignments: number;
  totalSubmissions: number;
  pendingReviews: number;
  correctionsRequested: number;
  joinedClasses: number;
  availableLessons: number;
  pendingAssignments: number;
  submittedWork: number;
  feedbackReceived: number;
}

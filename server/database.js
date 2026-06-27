import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

const emptyDb = () => ({
  users: [],
  classes: [],
  lessons: [],
  assignments: [],
  submissions: [],
  questions: [],
  activities: [],
  notifications: [],
});

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function createDatabase(dbPath = process.env.DB_PATH || DEFAULT_DB_PATH) {
  ensureDir(dbPath);

  let data = emptyDb();
  if (fs.existsSync(dbPath)) {
    try {
      data = { ...emptyDb(), ...JSON.parse(fs.readFileSync(dbPath, 'utf8')) };
    } catch {
      data = emptyDb();
    }
  } else {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  }

  const save = () => {
    ensureDir(dbPath);
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  };

  const id = (prefix) => `${prefix}${Date.now()}${Math.random().toString(36).slice(2, 6)}`;

  return {
    path: dbPath,
    getData: () => data,
    save,

    findUserByEmail: (email) => data.users.find((u) => u.email.toLowerCase() === email.toLowerCase()),
    findUserById: (userId) => data.users.find((u) => u.id === userId),
    getUsers: () => data.users,
    getTeachers: () => data.users.filter((u) => u.role === 'teacher'),
    getStudents: () => data.users.filter((u) => u.role === 'student'),
    hasHeadteacher: () => data.users.some((u) => u.role === 'headteacher'),
    createUser: (user) => {
      const entry = { id: id('u'), avatar: '', createdAt: new Date().toISOString(), ...user };
      data.users.push(entry);
      save();
      return entry;
    },
    updateUser: (userId, updates) => {
      const user = data.users.find((u) => u.id === userId);
      if (!user) return null;
      Object.assign(user, updates);
      save();
      return user;
    },

    getClasses: () => data.classes,
    createClass: (classData) => {
      const entry = {
        id: id('c'),
        code: `CLASS-${Math.floor(1000 + Math.random() * 9000)}`,
        students: [],
        createdAt: new Date().toISOString(),
        ...classData,
      };
      data.classes.push(entry);
      save();
      return entry;
    },
    joinClass: (code, studentId) => {
      const target = data.classes.find((c) => c.code === code);
      if (!target) return null;
      if (!target.students.includes(studentId)) {
        target.students.push(studentId);
        save();
      }
      return target;
    },
    updateClass: (classId, updates) => {
      const target = data.classes.find((c) => c.id === classId);
      if (!target) return null;
      Object.assign(target, updates);
      save();
      return target;
    },
    assignStudentsToClass: (classId, studentIds) => {
      const target = data.classes.find((c) => c.id === classId);
      if (!target) return null;
      const uniqueIds = [...new Set(studentIds.filter(Boolean))];
      target.students = uniqueIds;
      save();
      return target;
    },

    getLessons: () => data.lessons,
    createLesson: (lesson) => {
      const entry = {
        id: id('l'),
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...lesson,
      };
      data.lessons.push(entry);
      save();
      return entry;
    },
    updateLesson: (lessonId, updates) => {
      const lesson = data.lessons.find((l) => l.id === lessonId);
      if (!lesson) return null;
      Object.assign(lesson, updates, { updatedAt: new Date().toISOString() });
      save();
      return lesson;
    },

    getAssignments: () => data.assignments,
    createAssignment: (assignment) => {
      const entry = { id: id('a'), createdAt: new Date().toISOString(), ...assignment };
      data.assignments.push(entry);
      save();
      return entry;
    },

    getSubmissions: () => data.submissions,
    upsertSubmission: (payload) => {
      const existing = data.submissions.find(
        (s) => s.assignmentId === payload.assignmentId && s.studentId === payload.studentId,
      );
      if (existing) {
        const canResubmit = existing.status === 'returned' || existing.status === 'pending';
        if (!canResubmit) {
          return { submission: existing, created: false, blocked: true };
        }
        Object.assign(existing, payload, {
          status: 'submitted',
          submittedAt: new Date().toISOString(),
        });
        delete existing.score;
        save();
        return { submission: existing, created: false, blocked: false };
      }
      const entry = {
        id: id('s'),
        status: 'submitted',
        submittedAt: new Date().toISOString(),
        ...payload,
      };
      data.submissions.push(entry);
      save();
      return { submission: entry, created: true, blocked: false };
    },
    gradeSubmission: (submissionId, score, feedback) => {
      const submission = data.submissions.find((s) => s.id === submissionId);
      if (!submission) return null;
      submission.score = score;
      submission.feedback = feedback;
      submission.status = 'graded';
      save();
      return submission;
    },
    returnSubmission: (submissionId, feedback) => {
      const submission = data.submissions.find((s) => s.id === submissionId);
      if (!submission) return null;
      submission.feedback = feedback;
      submission.status = 'returned';
      submission.score = undefined;
      save();
      return submission;
    },

    getQuestions: () => data.questions,
    createQuestion: (question) => {
      const entry = { id: id('q'), replies: [], createdAt: new Date().toISOString(), ...question };
      data.questions.push(entry);
      save();
      return entry;
    },
    addReply: (questionId, reply) => {
      const question = data.questions.find((q) => q.id === questionId);
      if (!question) return null;
      const entry = { id: id('r'), createdAt: new Date().toISOString(), ...reply };
      question.replies.push(entry);
      save();
      return question;
    },

    getActivities: () => data.activities,
    addActivity: (activity) => {
      const entry = { id: id('act'), timestamp: new Date().toISOString(), ...activity };
      data.activities.unshift(entry);
      save();
      return entry;
    },

    getNotifications: (userId) => data.notifications.filter((n) => n.userId === userId),
    createNotification: (notification) => {
      const entry = {
        id: id('n'),
        read: false,
        createdAt: new Date().toISOString(),
        ...notification,
      };
      data.notifications.unshift(entry);
      save();
      return entry;
    },
    markNotificationRead: (notificationId, userId) => {
      const notification = data.notifications.find((n) => n.id === notificationId && n.userId === userId);
      if (!notification) return null;
      notification.read = true;
      save();
      return notification;
    },
    markAllNotificationsRead: (userId) => {
      data.notifications
        .filter((n) => n.userId === userId && !n.read)
        .forEach((n) => { n.read = true; });
      save();
    },

    reset: () => {
      data = emptyDb();
      save();
    },
  };
}

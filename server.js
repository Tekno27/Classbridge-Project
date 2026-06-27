import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createDatabase } from './server/database.js';
import {
  hashPassword,
  verifyPassword,
  createToken,
  sanitizeUser,
  requireAuth,
  requireRole,
} from './server/auth.js';
import { saveUploadedFile, getUploadPath } from './server/storage.js';
import {
  notifyUsers,
  notifyHeadteachers,
  notifyClassStudents,
} from './server/notifications.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function splitBuffer(buffer, separator) {
  const sep = Buffer.isBuffer(separator) ? separator : Buffer.from(separator);
  const parts = [];
  let start = 0;
  let index = buffer.indexOf(sep, start);

  while (index !== -1) {
    parts.push(buffer.slice(start, index));
    start = index + sep.length;
    index = buffer.indexOf(sep, start);
  }

  parts.push(buffer.slice(start));
  return parts;
}

function parseMultipartBody(rawBody, boundary) {
  const parsed = {};
  const parts = splitBuffer(rawBody, `--${boundary}`).slice(1, -1);

  for (const part of parts) {
    const separator = part.indexOf('\r\n\r\n');
    if (separator === -1) continue;

    const headersBlock = part.subarray(0, separator).toString('utf8').trim();
    const bodyBlock = Buffer.from(part.subarray(separator + 4));
    const trimmedBody = bodyBlock.length >= 2
      && bodyBlock[bodyBlock.length - 2] === 13
      && bodyBlock[bodyBlock.length - 1] === 10
      ? bodyBlock.subarray(0, bodyBlock.length - 2)
      : bodyBlock;
    const headers = {};

    headersBlock.split('\r\n').forEach((headerLine) => {
      const separatorIndex = headerLine.indexOf(':');
      if (separatorIndex === -1) return;
      const key = headerLine.slice(0, separatorIndex).trim().toLowerCase();
      const value = headerLine.slice(separatorIndex + 1).trim();
      headers[key] = value;
    });

    const contentDisposition = headers['content-disposition'] || '';
    const nameMatch = contentDisposition.match(/name="([^"]+)"/);
    const filenameMatch = contentDisposition.match(/filename="([^"]*)"/);

    if (!nameMatch) continue;

    const fieldName = nameMatch[1];
    const hasFile = Boolean(filenameMatch && filenameMatch[1]);

    if (hasFile) {
      const attachment = saveUploadedFile(
        trimmedBody,
        filenameMatch[1],
        headers['content-type'] || 'application/octet-stream',
      );
      const currentAttachments = Array.isArray(parsed.attachments) ? parsed.attachments : [];
      parsed.attachments = [...currentAttachments, attachment];
      continue;
    }

    parsed[fieldName] = trimmedBody.toString('utf8');
  }

  return parsed;
}

function parseMultipart(req, res, next) {
  if (!req.headers['content-type']?.includes('multipart/form-data')) {
    return next();
  }

  const contentType = req.headers['content-type'];
  const boundaryMatch = contentType.match(/boundary=(?:(?:"([^"]+)")|([^;]+))/i);
  const boundary = boundaryMatch?.[1] || boundaryMatch?.[2];

  if (!boundary) {
    return res.status(400).json({ error: 'Missing multipart boundary' });
  }

  const chunks = [];
  req.on('data', (chunk) => {
    chunks.push(chunk);
  });
  req.on('end', () => {
    req.body = parseMultipartBody(Buffer.concat(chunks), boundary);
    next();
  });
}

function mapAttachments(items = []) {
  return items.map((item) => ({
    id: item.id || item.storedName,
    name: item.name || 'attachment',
    type: item.type || 'application/octet-stream',
    size: item.size || 0,
    storedName: item.storedName || item.id,
  }));
}

export function createApp(options = {}) {
  const db = createDatabase(options.dbPath);
  const app = express();
  const auth = requireAuth(db);

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(parseMultipart);

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'classbridge-api' });
  });

  app.get('/api/auth/setup-status', (_req, res) => {
    res.json({ needsHeadteacherSetup: !db.hasHeadteacher() });
  });

  app.post('/api/auth/register', (req, res) => {
    const { name, email, password, role } = req.body || {};
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (role !== 'headteacher') {
      return res.status(403).json({ error: 'Only the headteacher can register directly. Teachers and students are created by the headteacher.' });
    }
    if (db.hasHeadteacher()) {
      return res.status(403).json({ error: 'A headteacher account already exists. Please log in.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    if (db.findUserByEmail(email)) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const user = db.createUser({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      role: 'headteacher',
      passwordHash: hashPassword(password),
    });

    const safeUser = sanitizeUser(user);
    const token = createToken(user.id);
    return res.status(201).json({ user: safeUser, token });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.findUserByEmail(email);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const safeUser = sanitizeUser(user);
    const token = createToken(user.id);
    return res.json({ user: safeUser, token });
  });

  app.get('/api/auth/me', auth, (req, res) => {
    res.json(req.user);
  });

  app.patch('/api/users/:id', auth, (req, res) => {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { name, email } = req.body || {};
    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const existing = db.findUserByEmail(email);
    if (existing && existing.id !== req.params.id) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const updated = db.updateUser(req.params.id, {
      name: name.trim(),
      email: email.trim().toLowerCase(),
    });
    return res.json(sanitizeUser(updated));
  });

  app.get('/api/users/teachers', auth, requireRole('headteacher'), (_req, res) => {
    const teachers = db.getTeachers().map(sanitizeUser);
    const lessons = db.getLessons();
    const result = teachers.map((teacher) => {
      const teacherLessons = lessons.filter((lesson) => lesson.teacherId === teacher.id);
      return {
        ...teacher,
        lessonCount: teacherLessons.length,
        approvedLessonCount: teacherLessons.filter((lesson) => lesson.status === 'approved').length,
      };
    });
    res.json(result);
  });

  app.get('/api/users/students', auth, requireRole('headteacher'), (_req, res) => {
    res.json(db.getStudents().map(sanitizeUser));
  });

  app.post('/api/users', auth, requireRole('headteacher'), (req, res) => {
    const { name, email, password, role } = req.body || {};
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!['teacher', 'student'].includes(role)) {
      return res.status(400).json({ error: 'Can only create teacher or student accounts' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    if (db.findUserByEmail(email)) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const user = db.createUser({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      role,
      passwordHash: hashPassword(password),
    });

    notifyUsers(db, [user.id], {
      title: 'Your ClassBridge account is ready',
      detail: `Your ${role} account was created by the headteacher. You can now log in.`,
    });

    return res.status(201).json(sanitizeUser(user));
  });

  app.get('/api/notifications', auth, (req, res) => {
    res.json(db.getNotifications(req.user.id));
  });

  app.patch('/api/notifications/:id/read', auth, (req, res) => {
    const notification = db.markNotificationRead(req.params.id, req.user.id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    return res.json(notification);
  });

  app.patch('/api/notifications/read-all', auth, (req, res) => {
    db.markAllNotificationsRead(req.user.id);
    res.json({ success: true });
  });

  app.get('/api/uploads/:storedName', auth, (req, res) => {
    const filePath = getUploadPath(req.params.storedName);
    if (!filePath) {
      return res.status(404).json({ error: 'File not found' });
    }
    return res.sendFile(filePath);
  });

  app.get('/api/classes', auth, (_req, res) => {
    res.json(db.getClasses());
  });

  app.post('/api/classes', auth, requireRole('headteacher'), (req, res) => {
    const { name, subject, level, term, teacherId, studentIds = [] } = req.body || {};
    if (!name || !subject || !level || !term || !teacherId) {
      return res.status(400).json({ error: 'Missing required class fields' });
    }

    const teacher = db.findUserById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(400).json({ error: 'Invalid teacher selected' });
    }

    const validStudentIds = studentIds.filter((id) => {
      const student = db.findUserById(id);
      return student && student.role === 'student';
    });

    const newClass = db.createClass({
      name: String(name).trim(),
      subject,
      level,
      term,
      teacherId: teacher.id,
      teacherName: teacher.name,
      students: validStudentIds,
    });

    notifyUsers(db, [teacher.id], {
      title: 'New class assigned to you',
      detail: `You have been assigned to teach ${newClass.name}.`,
    });

    notifyUsers(db, validStudentIds, {
      title: 'You have been added to a class',
      detail: `You have been enrolled in ${newClass.name} with ${teacher.name}.`,
    });

    db.addActivity({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'assigned',
      target: `class ${newClass.name}`,
    });

    return res.status(201).json(newClass);
  });

  app.patch('/api/classes/:id', auth, requireRole('headteacher'), (req, res) => {
    const targetClass = db.getClasses().find((entry) => entry.id === req.params.id);
    if (!targetClass) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const { teacherId, studentIds } = req.body || {};
    const updates = {};

    if (teacherId) {
      const teacher = db.findUserById(teacherId);
      if (!teacher || teacher.role !== 'teacher') {
        return res.status(400).json({ error: 'Invalid teacher selected' });
      }
      updates.teacherId = teacher.id;
      updates.teacherName = teacher.name;
      notifyUsers(db, [teacher.id], {
        title: 'Class assignment updated',
        detail: `You have been assigned to teach ${targetClass.name}.`,
      });
    }

    if (Array.isArray(studentIds)) {
      const validStudentIds = studentIds.filter((id) => {
        const student = db.findUserById(id);
        return student && student.role === 'student';
      });
      updates.students = validStudentIds;
      const newlyAdded = validStudentIds.filter((id) => !targetClass.students.includes(id));
      notifyUsers(db, newlyAdded, {
        title: 'You have been added to a class',
        detail: `You have been enrolled in ${targetClass.name}.`,
      });
    }

    const updated = db.updateClass(req.params.id, updates);
    return res.json(updated);
  });

  app.post('/api/classes/join', auth, requireRole('student'), (_req, res) => {
    return res.status(403).json({ error: 'Students are enrolled by the headteacher. Contact your school administrator.' });
  });

  app.get('/api/lessons', auth, (_req, res) => {
    res.json(db.getLessons());
  });

  app.post('/api/lessons', auth, requireRole('teacher'), (req, res) => {
    const newLesson = db.createLesson({
      ...req.body,
      teacherId: req.user.id,
      teacherName: req.user.name,
    });
    return res.status(201).json(newLesson);
  });

  app.patch('/api/lessons/:id', auth, requireRole('teacher'), (req, res) => {
    const lesson = db.getLessons().find((entry) => entry.id === req.params.id);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    if (lesson.teacherId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updated = db.updateLesson(req.params.id, req.body);
    return res.json(updated);
  });

  app.post('/api/lessons/:id/submit', auth, requireRole('teacher'), (req, res) => {
    const lesson = db.getLessons().find((entry) => entry.id === req.params.id);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    if (lesson.teacherId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updated = db.updateLesson(req.params.id, { status: 'submitted' });
    notifyHeadteachers(db, {
      title: 'Lesson note submitted for review',
      detail: `${lesson.teacherName} submitted "${lesson.topic}" for approval.`,
    });
    return res.json(updated);
  });

  app.post('/api/lessons/:id/approve', auth, requireRole('headteacher'), (req, res) => {
    const lesson = db.getLessons().find((entry) => entry.id === req.params.id);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const updated = db.updateLesson(req.params.id, {
      status: 'approved',
      headteacherComment: req.body.comment || 'Approved.',
    });

    notifyUsers(db, [lesson.teacherId], {
      title: 'Lesson note approved',
      detail: `Your lesson "${lesson.topic}" was approved.`,
    });

    notifyClassStudents(db, lesson.classId, {
      title: 'New lesson available',
      detail: `"${lesson.topic}" is now available in ${lesson.className}.`,
    });

    return res.json(updated);
  });

  app.post('/api/lessons/:id/correction', auth, requireRole('headteacher'), (req, res) => {
    const lesson = db.getLessons().find((entry) => entry.id === req.params.id);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const updated = db.updateLesson(req.params.id, {
      status: 'correction_requested',
      headteacherComment: req.body.comment || 'Please revise this lesson note.',
    });

    notifyUsers(db, [lesson.teacherId], {
      title: 'Lesson correction requested',
      detail: `Your lesson "${lesson.topic}" needs revisions.`,
    });

    return res.json(updated);
  });

  app.get('/api/assignments', auth, (_req, res) => {
    res.json(db.getAssignments());
  });

  app.post('/api/assignments', auth, requireRole('teacher'), (req, res) => {
    const payload = req.body && typeof req.body === 'object' ? req.body : {};
    const attachments = mapAttachments(
      Array.isArray(payload.attachments) ? payload.attachments : (payload.attachments ? [payload.attachments] : []),
    );

    const newAssignment = db.createAssignment({
      ...payload,
      teacherId: req.user.id,
      teacherName: req.user.name,
      attachments,
    });

    notifyClassStudents(db, newAssignment.classId, {
      title: 'New assignment posted',
      detail: `${newAssignment.title} was added to ${newAssignment.className}.`,
    }, req.user.id);

    return res.status(201).json(newAssignment);
  });

  app.get('/api/submissions', auth, (_req, res) => {
    res.json(db.getSubmissions());
  });

  app.post('/api/submissions', auth, requireRole('student'), (req, res) => {
    const payload = req.body && typeof req.body === 'object' ? req.body : {};
    const attachments = mapAttachments(
      Array.isArray(payload.attachments) ? payload.attachments : (payload.attachments ? [payload.attachments] : []),
    );

    const { submission, created, blocked } = db.upsertSubmission({
      ...payload,
      studentId: req.user.id,
      studentName: req.user.name,
      attachments,
    });

    if (blocked) {
      return res.status(409).json({ error: 'This assignment has already been submitted and is awaiting review.' });
    }

    const assignment = db.getAssignments().find((entry) => entry.id === submission.assignmentId);
    if (assignment) {
      notifyUsers(db, [assignment.teacherId], {
        title: 'New assignment submission',
        detail: `${req.user.name} submitted work for "${assignment.title}".`,
      });
    }

    return res.status(created ? 201 : 200).json(submission);
  });

  app.patch('/api/submissions/:id/grade', auth, requireRole('teacher'), (req, res) => {
    const submission = db.getSubmissions().find((entry) => entry.id === req.params.id);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const assignment = db.getAssignments().find((entry) => entry.id === submission.assignmentId);
    if (!assignment || assignment.teacherId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const graded = db.gradeSubmission(req.params.id, req.body.score, req.body.feedback);
    notifyUsers(db, [submission.studentId], {
      title: 'Assignment feedback ready',
      detail: `Your submission for "${submission.assignmentTitle}" has been graded.`,
    });
    return res.json(graded);
  });

  app.post('/api/submissions/:id/return', auth, requireRole('teacher'), (req, res) => {
    const submission = db.getSubmissions().find((entry) => entry.id === req.params.id);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const assignment = db.getAssignments().find((entry) => entry.id === submission.assignmentId);
    if (!assignment || assignment.teacherId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (!req.body.feedback?.trim()) {
      return res.status(400).json({ error: 'Feedback is required when returning work' });
    }

    const returned = db.returnSubmission(req.params.id, req.body.feedback.trim());
    notifyUsers(db, [submission.studentId], {
      title: 'Assignment returned for revision',
      detail: `Your submission for "${submission.assignmentTitle}" needs to be redone.`,
    });
    return res.json(returned);
  });

  app.get('/api/questions', auth, (_req, res) => {
    res.json(db.getQuestions());
  });

  app.post('/api/questions', auth, requireRole('student'), (req, res) => {
    const newQuestion = db.createQuestion({
      ...req.body,
      studentId: req.user.id,
      studentName: req.user.name,
    });

    const lesson = db.getLessons().find((entry) => entry.id === newQuestion.lessonId);
    if (lesson) {
      notifyUsers(db, [lesson.teacherId], {
        title: 'New student question',
        detail: `${req.user.name} asked a question about "${lesson.topic}".`,
      });
    }

    return res.status(201).json(newQuestion);
  });

  app.post('/api/questions/:id/replies', auth, requireRole('teacher'), (req, res) => {
    const question = db.getQuestions().find((entry) => entry.id === req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const lesson = db.getLessons().find((entry) => entry.id === question.lessonId);
    if (!lesson || lesson.teacherId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updated = db.addReply(req.params.id, {
      ...req.body,
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
    });

    notifyUsers(db, [question.studentId], {
      title: 'Teacher replied to your question',
      detail: `You received a reply about "${question.lessonTopic}".`,
    });

    return res.json(updated);
  });

  app.get('/api/activities', auth, (_req, res) => {
    res.json(db.getActivities());
  });

  app.post('/api/activities', auth, (req, res) => {
    const newActivity = db.addActivity({
      ...req.body,
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
    });
    return res.status(201).json(newActivity);
  });

  app.get('/api/stats/teacher/:teacherId', auth, (req, res) => {
    if (req.user.role !== 'headteacher' && req.user.id !== req.params.teacherId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const teacherId = req.params.teacherId;
    const classes = db.getClasses().filter((entry) => entry.teacherId === teacherId);
    const lessons = db.getLessons().filter((entry) => entry.teacherId === teacherId);
    const assignments = db.getAssignments().filter((entry) => entry.teacherId === teacherId);
    const submissions = db.getSubmissions();

    res.json({
      totalClasses: classes.length,
      pendingLessons: lessons.filter((entry) => entry.status === 'draft' || entry.status === 'correction_requested').length,
      approvedLessons: lessons.filter((entry) => entry.status === 'approved').length,
      totalAssignments: assignments.length,
      totalSubmissions: submissions.filter((entry) => assignments.some((assignment) => assignment.id === entry.assignmentId)).length,
    });
  });

  app.get('/api/stats/headteacher', auth, requireRole('headteacher'), (_req, res) => {
    const lessons = db.getLessons();
    const classes = db.getClasses();
    res.json({
      pendingReviews: lessons.filter((entry) => entry.status === 'submitted').length,
      approvedLessons: lessons.filter((entry) => entry.status === 'approved').length,
      correctionsRequested: lessons.filter((entry) => entry.status === 'correction_requested').length,
      totalClasses: classes.length,
      totalTeachers: new Set(classes.map((entry) => entry.teacherId)).size,
      totalStudents: new Set(classes.flatMap((entry) => entry.students)).size,
    });
  });

  app.get('/api/stats/student/:studentId', auth, (req, res) => {
    if (req.user.role !== 'headteacher' && req.user.id !== req.params.studentId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const studentId = req.params.studentId;
    const studentClasses = db.getClasses().filter((entry) => entry.students.includes(studentId));
    const classIds = studentClasses.map((entry) => entry.id);
    const lessons = db.getLessons();
    const assignments = db.getAssignments();
    const submissions = db.getSubmissions().filter((entry) => entry.studentId === studentId);

    res.json({
      joinedClasses: studentClasses.length,
      availableLessons: lessons.filter((entry) => classIds.includes(entry.classId) && entry.status === 'approved').length,
      pendingAssignments: assignments.filter((entry) => classIds.includes(entry.classId)).length
        - submissions.filter((entry) => (entry.status === 'submitted' || entry.status === 'graded')).length,
      submittedWork: submissions.filter((entry) => entry.status === 'submitted' || entry.status === 'graded').length,
      feedbackReceived: submissions.filter((entry) => entry.status === 'graded').length,
    });
  });

  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('/*splat', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'Not found' });
    }
    return res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });

  return { app, db };
}

export function startServer(port = process.env.PORT || 4000) {
  const { app } = createApp();
  return app.listen(port, '0.0.0.0', () => {
    console.log(`Classbridge API listening on port ${port}`);
  });
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

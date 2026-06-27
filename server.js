import express from 'express';
import cors from 'cors';

const users = [
  { id: 'u1', name: 'Mr. Kwame Asante', email: 'teacher@classbridge.test', role: 'teacher', avatar: '', password: 'password123' },
  { id: 'u2', name: 'Ama Serwaa', email: 'student@classbridge.test', role: 'student', avatar: '', password: 'password123' },
  { id: 'u3', name: 'Mrs. Abena Owusu', email: 'headteacher@classbridge.test', role: 'headteacher', avatar: '', password: 'password123' },
];

const classes = [
  {
    id: 'c1',
    name: 'JHS 2 Integrated Science',
    subject: 'Integrated Science',
    level: 'JHS 2',
    term: 'Second Term',
    code: 'JHS2-SCI-4821',
    teacherId: 'u1',
    teacherName: 'Mr. Kwame Asante',
    students: ['u2'],
    createdAt: '2026-06-20T10:00:00Z',
  },
  {
    id: 'c2',
    name: 'JHS 1 Mathematics',
    subject: 'Mathematics',
    level: 'JHS 1',
    term: 'Second Term',
    code: 'JHS1-MATH-7392',
    teacherId: 'u1',
    teacherName: 'Mr. Kwame Asante',
    students: ['u2'],
    createdAt: '2026-06-22T14:30:00Z',
  },
];

const lessons = [
  {
    id: 'l1',
    classId: 'c1',
    className: 'JHS 2 Integrated Science',
    teacherId: 'u1',
    teacherName: 'Mr. Kwame Asante',
    subject: 'Integrated Science',
    week: 4,
    date: '2026-06-25',
    topic: 'Photosynthesis',
    subTopic: 'The process by which plants make their own food',
    duration: 60,
    learningObjectives: 'Students will understand how plants produce food using sunlight, water, and carbon dioxide.',
    previousKnowledge: 'Students know that plants need sunlight and water to grow.',
    teachingMaterials: 'Textbook, chart showing photosynthesis process, potted plant, iodine solution.',
    introduction: 'Show students a potted plant and ask: "How do you think this plant gets its food?" Discuss responses for 5 minutes.',
    teacherActivities: 'Explain the photosynthesis equation. Demonstrate the starch test using iodine solution on a leaf. Guide students through the process step by step.',
    learnerActivities: 'Draw and label the photosynthesis process. Work in groups to discuss what happens when a plant is kept in the dark for 3 days. Present findings to class.',
    assessment: 'Draw a well-labeled diagram of photosynthesis. Write the word equation for photosynthesis. Explain why plants are called producers.',
    closure: 'Summarize key points. Assign homework: observe a plant at home and note changes when placed in different light conditions.',
    remarks: 'Students showed great interest in the starch test demonstration.',
    timeAllocations: [
      { id: 'ta1', activity: 'Introduction', minutes: 5 },
      { id: 'ta2', activity: 'Teacher Presentation', minutes: 20 },
      { id: 'ta3', activity: 'Group Activity', minutes: 20 },
      { id: 'ta4', activity: 'Assessment', minutes: 10 },
      { id: 'ta5', activity: 'Closure', minutes: 5 },
    ],
    status: 'approved',
    headteacherComment: 'Well-structured lesson with clear activities. Approved for teaching.',
    createdAt: '2026-06-23T08:00:00Z',
    updatedAt: '2026-06-24T10:30:00Z',
  },
  {
    id: 'l2',
    classId: 'c1',
    className: 'JHS 2 Integrated Science',
    teacherId: 'u1',
    teacherName: 'Mr. Kwame Asante',
    subject: 'Integrated Science',
    week: 5,
    date: '2026-06-27',
    topic: 'Respiration in Plants',
    subTopic: 'How plants breathe and release energy',
    duration: 60,
    learningObjectives: 'Students will describe the process of respiration in plants and differentiate it from photosynthesis.',
    previousKnowledge: 'Students understand photosynthesis and that plants need energy.',
    teachingMaterials: 'Textbook, germinating seeds in a flask, lime water, charts.',
    introduction: 'Review photosynthesis from previous lesson. Ask: "Do plants also need to release energy? How?"',
    teacherActivities: 'Explain aerobic respiration. Show experiment with germinating seeds and lime water. Compare photosynthesis and respiration using a chart.',
    learnerActivities: 'Observe the lime water experiment and record observations. Complete a comparison table of photosynthesis vs respiration.',
    assessment: 'Define respiration. Write the word equation for aerobic respiration. State two differences between photosynthesis and respiration.',
    closure: 'Recap the importance of respiration for plant survival. Preview next lesson on fermentation.',
    remarks: '',
    timeAllocations: [
      { id: 'ta6', activity: 'Introduction', minutes: 5 },
      { id: 'ta7', activity: 'Teacher Presentation', minutes: 25 },
      { id: 'ta8', activity: 'Experiment Observation', minutes: 15 },
      { id: 'ta9', activity: 'Assessment', minutes: 10 },
      { id: 'ta10', activity: 'Closure', minutes: 5 },
    ],
    status: 'submitted',
    createdAt: '2026-06-26T09:00:00Z',
    updatedAt: '2026-06-26T09:00:00Z',
  },
];

const assignments = [
  {
    id: 'a1',
    classId: 'c1',
    className: 'JHS 2 Integrated Science',
    teacherId: 'u1',
    teacherName: 'Mr. Kwame Asante',
    title: 'Photosynthesis Diagram',
    description: 'Draw a well-labeled diagram showing the process of photosynthesis.',
    totalMarks: 20,
    dueDate: '2026-06-30',
    createdAt: '2026-06-25T10:00:00Z',
  },
];

const submissions = [
  {
    id: 's1',
    assignmentId: 'a1',
    assignmentTitle: 'Photosynthesis Diagram',
    studentId: 'u2',
    studentName: 'Ama Serwaa',
    classId: 'c1',
    answer: 'I have drawn a diagram showing the process of photosynthesis.',
    score: 18,
    feedback: 'Excellent work.',
    status: 'graded',
    submittedAt: '2026-06-26T15:30:00Z',
  },
];

const questions = [
  {
    id: 'q1',
    lessonId: 'l1',
    lessonTopic: 'Photosynthesis',
    studentId: 'u2',
    studentName: 'Ama Serwaa',
    question: 'Sir, I am confused about when photosynthesis happens.',
    replies: [],
    createdAt: '2026-06-26T12:00:00Z',
  },
];

const activities = [
  {
    id: 'act1',
    userId: 'u1',
    userName: 'Mr. Kwame Asante',
    userRole: 'teacher',
    action: 'created',
    target: 'class',
    timestamp: '2026-06-26T08:00:00Z',
  },
];

function parseMultipartBody(rawBody, boundary) {
  const parsed = {};
  const parts = rawBody.split(`--${boundary}`).slice(1, -1);

  for (const part of parts) {
    const separatorIndex = part.indexOf('\r\n\r\n');
    if (separatorIndex === -1) continue;

    const headersBlock = part.slice(0, separatorIndex).trim();
    const bodyBlock = part.slice(separatorIndex + 4).replace(/\r\n$/, '');
    const headers = {};

    headersBlock.split('\r\n').forEach((headerLine) => {
      const separator = headerLine.indexOf(':');
      if (separator === -1) return;
      const key = headerLine.slice(0, separator).trim().toLowerCase();
      const value = headerLine.slice(separator + 1).trim();
      headers[key] = value;
    });

    const contentDisposition = headers['content-disposition'] || '';
    const nameMatch = contentDisposition.match(/name="([^"]+)"/);
    const filenameMatch = contentDisposition.match(/filename="([^"]*)"/);

    if (!nameMatch) continue;

    const fieldName = nameMatch[1];
    const hasFile = Boolean(filenameMatch && filenameMatch[1]);

    if (hasFile) {
      const attachment = {
        name: filenameMatch[1],
        type: headers['content-type'] || 'application/octet-stream',
        size: Buffer.byteLength(bodyBlock, 'utf8'),
      };
      const currentAttachments = Array.isArray(parsed.attachments) ? parsed.attachments : [];
      parsed.attachments = [...currentAttachments, attachment];
      continue;
    }

    parsed[fieldName] = bodyBlock;
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

  let rawBody = '';
  req.setEncoding('utf8');
  req.on('data', (chunk) => {
    rawBody += chunk;
  });
  req.on('end', () => {
    req.body = parseMultipartBody(rawBody, boundary);
    next();
  });
}

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(parseMultipart);

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'classbridge-api' });
  });

  app.get('/api/users', (_req, res) => {
    res.json(users);
  });

  app.post('/api/auth/register', (req, res) => {
    const { name, email, password, role } = req.body || {};
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingUser = users.find((entry) => entry.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const newUser = {
      id: `u${Date.now()}`,
      name,
      email,
      role,
      avatar: '',
      password,
    };
    users.push(newUser);
    const { password: _password, ...safeUser } = newUser;
    return res.status(201).json(safeUser);
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = users.find((entry) => entry.email.toLowerCase() === email.toLowerCase() && entry.password === password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { password: _password, ...safeUser } = user;
    return res.json(safeUser);
  });

  app.get('/api/classes', (_req, res) => {
    res.json(classes);
  });

  app.post('/api/classes', (req, res) => {
    const newClass = {
      id: `c${Date.now()}`,
      code: `CLASS-${Math.floor(1000 + Math.random() * 9000)}`,
      students: [],
      createdAt: new Date().toISOString(),
      ...req.body,
    };
    classes.push(newClass);
    res.status(201).json(newClass);
  });

  app.post('/api/classes/join', (req, res) => {
    const { code, studentId } = req.query;
    const targetClass = classes.find((entry) => entry.code === code);
    if (!targetClass) {
      return res.status(404).json({ error: 'Class not found' });
    }
    if (targetClass.students.includes(studentId)) {
      return res.status(200).json(targetClass);
    }
    targetClass.students.push(studentId);
    return res.status(200).json(targetClass);
  });

  app.get('/api/lessons', (_req, res) => {
    res.json(lessons);
  });

  app.post('/api/lessons', (req, res) => {
    const newLesson = {
      id: `l${Date.now()}`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...req.body,
    };
    lessons.push(newLesson);
    res.status(201).json(newLesson);
  });

  app.patch('/api/lessons/:id', (req, res) => {
    const lesson = lessons.find((entry) => entry.id === req.params.id);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    Object.assign(lesson, req.body, { updatedAt: new Date().toISOString() });
    return res.json(lesson);
  });

  app.post('/api/lessons/:id/submit', (req, res) => {
    const lesson = lessons.find((entry) => entry.id === req.params.id);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    lesson.status = 'submitted';
    lesson.updatedAt = new Date().toISOString();
    return res.json(lesson);
  });

  app.post('/api/lessons/:id/approve', (req, res) => {
    const lesson = lessons.find((entry) => entry.id === req.params.id);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    lesson.status = 'approved';
    lesson.headteacherComment = req.body.comment || 'Approved.';
    lesson.updatedAt = new Date().toISOString();
    return res.json(lesson);
  });

  app.post('/api/lessons/:id/correction', (req, res) => {
    const lesson = lessons.find((entry) => entry.id === req.params.id);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    lesson.status = 'correction_requested';
    lesson.headteacherComment = req.body.comment || 'Please revise this lesson note.';
    lesson.updatedAt = new Date().toISOString();
    return res.json(lesson);
  });

  app.get('/api/assignments', (_req, res) => {
    res.json(assignments);
  });

  app.post('/api/assignments', (req, res) => {
    const payload = req.body && typeof req.body === 'object' ? req.body : {};
    const attachments = Array.isArray(payload.attachments)
      ? payload.attachments
      : (payload.attachments ? [payload.attachments] : []);

    const newAssignment = {
      id: `a${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...payload,
      attachments: attachments.map((item) => {
        if (typeof item === 'string') {
          return { name: item, type: 'application/octet-stream', size: item.length };
        }

        return {
          name: item?.name || 'attachment',
          type: item?.type || 'application/octet-stream',
          size: item?.size || 0,
        };
      }),
    };
    assignments.push(newAssignment);
    res.status(201).json(newAssignment);
  });

  app.get('/api/submissions', (_req, res) => {
    res.json(submissions);
  });

  app.post('/api/submissions', (req, res) => {
    const payload = req.body && typeof req.body === 'object' ? req.body : {};
    const existing = submissions.find((entry) => entry.assignmentId === payload.assignmentId && entry.studentId === payload.studentId);
    const attachments = Array.isArray(payload.attachments)
      ? payload.attachments
      : (payload.attachments ? [payload.attachments] : []);

    if (existing) {
      Object.assign(existing, payload, {
        status: 'submitted',
        submittedAt: new Date().toISOString(),
        attachments: attachments.map((item) => {
          if (typeof item === 'string') {
            return { name: item, type: 'application/octet-stream', size: item.length };
          }

          return {
            name: item?.name || 'attachment',
            type: item?.type || 'application/octet-stream',
            size: item?.size || 0,
          };
        }),
      });
      return res.status(200).json(existing);
    }

    const newSubmission = {
      id: `s${Date.now()}`,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      ...payload,
      attachments: attachments.map((item) => {
        if (typeof item === 'string') {
          return { name: item, type: 'application/octet-stream', size: item.length };
        }

        return {
          name: item?.name || 'attachment',
          type: item?.type || 'application/octet-stream',
          size: item?.size || 0,
        };
      }),
    };
    submissions.push(newSubmission);
    return res.status(201).json(newSubmission);
  });

  app.patch('/api/submissions/:id/grade', (req, res) => {
    const submission = submissions.find((entry) => entry.id === req.params.id);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    submission.score = req.body.score;
    submission.feedback = req.body.feedback;
    submission.status = 'graded';
    return res.json(submission);
  });

  app.get('/api/questions', (_req, res) => {
    res.json(questions);
  });

  app.post('/api/questions', (req, res) => {
    const newQuestion = {
      id: `q${Date.now()}`,
      replies: [],
      createdAt: new Date().toISOString(),
      ...req.body,
    };
    questions.push(newQuestion);
    res.status(201).json(newQuestion);
  });

  app.post('/api/questions/:id/replies', (req, res) => {
    const question = questions.find((entry) => entry.id === req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    const newReply = {
      id: `r${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...req.body,
    };
    question.replies.push(newReply);
    return res.json(question);
  });

  app.get('/api/activities', (_req, res) => {
    res.json(activities);
  });

  app.post('/api/activities', (req, res) => {
    const newActivity = {
      id: `act${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...req.body,
    };
    activities.unshift(newActivity);
    res.status(201).json(newActivity);
  });

  app.get('/api/stats/teacher/:teacherId', (req, res) => {
    const teacherId = req.params.teacherId;
    const teacherClasses = classes.filter((entry) => entry.teacherId === teacherId);
    const teacherLessons = lessons.filter((entry) => entry.teacherId === teacherId);
    const teacherAssignments = assignments.filter((entry) => entry.teacherId === teacherId);
    res.json({
      totalClasses: teacherClasses.length,
      pendingLessons: teacherLessons.filter((entry) => entry.status === 'draft' || entry.status === 'correction_requested').length,
      approvedLessons: teacherLessons.filter((entry) => entry.status === 'approved').length,
      totalAssignments: teacherAssignments.length,
      totalSubmissions: submissions.filter((entry) => teacherAssignments.some((assignment) => assignment.id === entry.assignmentId)).length,
    });
  });

  app.get('/api/stats/headteacher', (_req, res) => {
    res.json({
      pendingReviews: lessons.filter((entry) => entry.status === 'submitted').length,
      approvedLessons: lessons.filter((entry) => entry.status === 'approved').length,
      correctionsRequested: lessons.filter((entry) => entry.status === 'correction_requested').length,
      totalClasses: classes.length,
      totalTeachers: new Set(classes.map((entry) => entry.teacherId)).size,
      totalStudents: new Set(classes.flatMap((entry) => entry.students)).size,
    });
  });

  app.get('/api/stats/student/:studentId', (req, res) => {
    const studentId = req.params.studentId;
    const studentClasses = classes.filter((entry) => entry.students.includes(studentId));
    const classIds = studentClasses.map((entry) => entry.id);
    const availableLessons = lessons.filter((entry) => classIds.includes(entry.classId) && entry.status === 'approved');
    const studentAssignments = assignments.filter((entry) => classIds.includes(entry.classId));
    const studentSubmissions = submissions.filter((entry) => entry.studentId === studentId);
    res.json({
      joinedClasses: studentClasses.length,
      availableLessons: availableLessons.length,
      pendingAssignments: studentAssignments.length - studentSubmissions.filter((entry) => entry.status === 'submitted' || entry.status === 'graded').length,
      submittedWork: studentSubmissions.filter((entry) => entry.status === 'submitted' || entry.status === 'graded').length,
      feedbackReceived: studentSubmissions.filter((entry) => entry.status === 'graded').length,
    });
  });

  return app;
}

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// after all /api routes, before return app
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not found' });
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

export function startServer(port = process.env.PORT || 4000) {
  const app = createApp();
  return app.listen(port, "0.0.0.0",() => {
    console.log(`Classbridge API listening on port ${port}`);
  });
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

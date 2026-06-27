import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { createApp } from '../server.js';

function createTestApp() {
  const dbPath = path.join(os.tmpdir(), `classbridge-test-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
  const { app, db } = createApp({ dbPath });
  const server = app.listen(0);

  const cleanup = () => {
    server.close();
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
  };

  return { app, db, server, cleanup, dbPath };
}

async function getPort(server) {
  const address = server.address();
  return typeof address === 'object' && address ? address.port : 0;
}

async function registerHeadteacher(server) {
  const port = await getPort(server);
  const response = await fetch(`http://127.0.0.1:${port}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Head Teacher',
      email: 'head@test.com',
      password: 'secret123',
      role: 'headteacher',
    }),
  });
  const body = await response.json();
  return { response, body };
}

async function createSchoolUser(server, headteacherToken, { name, email, password, role }) {
  const port = await getPort(server);
  const response = await fetch(`http://127.0.0.1:${port}/api/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${headteacherToken}`,
    },
    body: JSON.stringify({ name, email, password, role }),
  });
  const body = await response.json();
  return { response, body };
}

async function loginUser(server, email, password) {
  const port = await getPort(server);
  const response = await fetch(`http://127.0.0.1:${port}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const body = await response.json();
  return { response, body };
}

async function setupSchool(server) {
  const headteacher = await registerHeadteacher(server);
  assert.equal(headteacher.response.status, 201);

  const teacher = await createSchoolUser(server, headteacher.body.token, {
    name: 'Mr. Teacher',
    email: 'teacher@test.com',
    password: 'secret123',
    role: 'teacher',
  });
  assert.equal(teacher.response.status, 201);

  const student = await createSchoolUser(server, headteacher.body.token, {
    name: 'Student One',
    email: 'student@test.com',
    password: 'secret123',
    role: 'student',
  });
  assert.equal(student.response.status, 201);

  const teacherLogin = await loginUser(server, 'teacher@test.com', 'secret123');
  const studentLogin = await loginUser(server, 'student@test.com', 'secret123');

  return {
    headteacher: headteacher.body,
    teacher: { user: teacher.body, token: teacherLogin.body.token },
    student: { user: student.body, token: studentLogin.body.token },
  };
}

test('GET /api/health returns a healthy response', async () => {
  const { server, cleanup } = createTestApp();

  try {
    const port = await getPort(server);
    const response = await fetch(`http://127.0.0.1:${port}/api/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.status, 'ok');
  } finally {
    cleanup();
  }
});

test('Only headteacher can self-register and teacher registration is blocked', async () => {
  const { server, cleanup } = createTestApp();

  try {
    const headteacher = await registerHeadteacher(server);
    assert.equal(headteacher.response.status, 201);
    assert.equal(headteacher.body.user.role, 'headteacher');

    const teacherAttempt = await registerHeadteacher(server);
    assert.equal(teacherAttempt.response.status, 403);

    const port = await getPort(server);
    const blockedTeacher = await fetch(`http://127.0.0.1:${port}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Blocked Teacher',
        email: 'blocked-teacher@test.com',
        password: 'secret123',
        role: 'teacher',
      }),
    });
    assert.equal(blockedTeacher.status, 403);
  } finally {
    cleanup();
  }
});

test('Protected routes require authentication', async () => {
  const { server, cleanup } = createTestApp();

  try {
    const port = await getPort(server);
    const response = await fetch(`http://127.0.0.1:${port}/api/classes`);
    assert.equal(response.status, 401);
  } finally {
    cleanup();
  }
});

test('Headteacher can create users and assign a class', async () => {
  const { server, cleanup } = createTestApp();

  try {
    const school = await setupSchool(server);
    const port = await getPort(server);

    const createClass = await fetch(`http://127.0.0.1:${port}/api/classes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${school.headteacher.token}`,
      },
      body: JSON.stringify({
        name: 'JHS 2 Science',
        subject: 'Science',
        level: 'JHS 2',
        term: 'Second Term',
        teacherId: school.teacher.user.id,
        studentIds: [school.student.user.id],
      }),
    });
    const createdClass = await createClass.json();

    assert.equal(createClass.status, 201);
    assert.equal(createdClass.teacherId, school.teacher.user.id);
    assert.ok(createdClass.students.includes(school.student.user.id));

    const join = await fetch(`http://127.0.0.1:${port}/api/classes/join?code=${encodeURIComponent(createdClass.code)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${school.student.token}`,
      },
    });
    assert.equal(join.status, 403);
  } finally {
    cleanup();
  }
});

test('POST /api/lessons/:id/submit updates lesson status', async () => {
  const { server, cleanup } = createTestApp();

  try {
    const school = await setupSchool(server);
    const port = await getPort(server);

    const createClass = await fetch(`http://127.0.0.1:${port}/api/classes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${school.headteacher.token}`,
      },
      body: JSON.stringify({
        name: 'JHS 1 Maths',
        subject: 'Maths',
        level: 'JHS 1',
        term: 'First Term',
        teacherId: school.teacher.user.id,
        studentIds: [],
      }),
    });
    const classBody = await createClass.json();

    const createLesson = await fetch(`http://127.0.0.1:${port}/api/lessons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${school.teacher.token}`,
      },
      body: JSON.stringify({
        classId: classBody.id,
        className: classBody.name,
        subject: 'Maths',
        week: 1,
        date: '2026-06-27',
        topic: 'Fractions',
        subTopic: 'Adding fractions',
        duration: 60,
        learningObjectives: 'Add fractions',
        previousKnowledge: 'Know numerators',
        teachingMaterials: 'Board',
        introduction: 'Intro',
        teacherActivities: 'Teach',
        learnerActivities: 'Practice',
        assessment: 'Quiz',
        closure: 'Recap',
        remarks: '',
        timeAllocations: [],
      }),
    });
    const lesson = await createLesson.json();

    const submit = await fetch(`http://127.0.0.1:${port}/api/lessons/${lesson.id}/submit`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${school.teacher.token}`,
      },
    });
    const submitted = await submit.json();

    assert.equal(submit.status, 200);
    assert.equal(submitted.status, 'submitted');
  } finally {
    cleanup();
  }
});

test('Teacher can return a submission for revision', async () => {
  const { server, cleanup } = createTestApp();

  try {
    const school = await setupSchool(server);
    const port = await getPort(server);

    const createClass = await fetch(`http://127.0.0.1:${port}/api/classes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${school.headteacher.token}`,
      },
      body: JSON.stringify({
        name: 'JHS 3 English',
        subject: 'English',
        level: 'JHS 3',
        term: 'Second Term',
        teacherId: school.teacher.user.id,
        studentIds: [school.student.user.id],
      }),
    });
    const classBody = await createClass.json();

    const createAssignment = await fetch(`http://127.0.0.1:${port}/api/assignments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${school.teacher.token}`,
      },
      body: JSON.stringify({
        classId: classBody.id,
        className: classBody.name,
        title: 'Essay',
        description: 'Write an essay',
        totalMarks: 20,
        dueDate: '2026-07-01',
      }),
    });
    const assignment = await createAssignment.json();

    const submission = await fetch(`http://127.0.0.1:${port}/api/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${school.student.token}`,
      },
      body: JSON.stringify({
        assignmentId: assignment.id,
        assignmentTitle: assignment.title,
        classId: classBody.id,
        answer: 'Working submission',
      }),
    });
    const submitted = await submission.json();
    assert.equal(submission.status, 201);

    const returned = await fetch(`http://127.0.0.1:${port}/api/submissions/${submitted.id}/return`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${school.teacher.token}`,
      },
      body: JSON.stringify({ feedback: 'Please expand your introduction.' }),
    });
    const returnedBody = await returned.json();
    assert.equal(returned.status, 200);
    assert.equal(returnedBody.status, 'returned');

    const resubmit = await fetch(`http://127.0.0.1:${port}/api/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${school.student.token}`,
      },
      body: JSON.stringify({
        assignmentId: assignment.id,
        assignmentTitle: assignment.title,
        classId: classBody.id,
        answer: 'Improved submission',
      }),
    });
    const resubmitted = await resubmit.json();
    assert.equal(resubmit.status, 200);
    assert.equal(resubmitted.status, 'submitted');
    assert.equal(resubmitted.answer, 'Improved submission');
  } finally {
    cleanup();
  }
});

test('POST /api/assignments accepts file attachments', async () => {
  const { server, cleanup } = createTestApp();

  try {
    const school = await setupSchool(server);
    const port = await getPort(server);

    const createClass = await fetch(`http://127.0.0.1:${port}/api/classes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${school.headteacher.token}`,
      },
      body: JSON.stringify({
        name: 'JHS 2 Integrated Science',
        subject: 'Integrated Science',
        level: 'JHS 2',
        term: 'Second Term',
        teacherId: school.teacher.user.id,
        studentIds: [],
      }),
    });
    const classBody = await createClass.json();

    const formData = new FormData();
    formData.append('classId', classBody.id);
    formData.append('className', classBody.name);
    formData.append('title', 'Attachment assignment');
    formData.append('description', 'Please review the attached notes');
    formData.append('totalMarks', '25');
    formData.append('dueDate', '2026-07-10');
    formData.append('attachments', new File(['file contents'], 'notes.pdf', { type: 'application/pdf' }));

    const response = await fetch(`http://127.0.0.1:${port}/api/assignments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${school.teacher.token}`,
      },
      body: formData,
    });
    const body = await response.json();

    assert.equal(response.status, 201);
    assert.equal(body.attachments[0].name, 'notes.pdf');
    assert.equal(body.attachments[0].type, 'application/pdf');
  } finally {
    cleanup();
  }
});

test('PATCH /api/users/:id updates profile', async () => {
  const { server, cleanup } = createTestApp();

  try {
    const school = await setupSchool(server);
    const port = await getPort(server);
    const response = await fetch(`http://127.0.0.1:${port}/api/users/${school.teacher.user.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${school.teacher.token}`,
      },
      body: JSON.stringify({
        name: 'Updated Name',
        email: 'updated-teacher@test.com',
      }),
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.name, 'Updated Name');
    assert.equal(body.email, 'updated-teacher@test.com');
  } finally {
    cleanup();
  }
});

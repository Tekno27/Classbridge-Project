import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../server.js';

test('GET /api/health returns a healthy response', async () => {
  const app = createApp();
  const server = app.listen(0);

  try {
    const address = server.address();
    const port = typeof address === 'object' && address ? address.port : 0;
    const response = await fetch(`http://127.0.0.1:${port}/api/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.status, 'ok');
  } finally {
    server.close();
  }
});

test('GET /api/classes returns seeded classes', async () => {
  const app = createApp();
  const server = app.listen(0);

  try {
    const address = server.address();
    const port = typeof address === 'object' && address ? address.port : 0;
    const response = await fetch(`http://127.0.0.1:${port}/api/classes`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.ok(Array.isArray(body));
    assert.ok(body.length > 0);
  } finally {
    server.close();
  }
});

test('GET /api/users returns seeded users', async () => {
  const app = createApp();
  const server = app.listen(0);

  try {
    const address = server.address();
    const port = typeof address === 'object' && address ? address.port : 0;
    const response = await fetch(`http://127.0.0.1:${port}/api/users`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.ok(Array.isArray(body));
    assert.ok(body.some((user) => user.role === 'teacher'));
  } finally {
    server.close();
  }
});

test('GET /api/lessons returns seeded lessons', async () => {
  const app = createApp();
  const server = app.listen(0);

  try {
    const address = server.address();
    const port = typeof address === 'object' && address ? address.port : 0;
    const response = await fetch(`http://127.0.0.1:${port}/api/lessons`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.ok(Array.isArray(body));
    assert.ok(body.length > 0);
  } finally {
    server.close();
  }
});

test('POST /api/auth/login authenticates the seeded demo user', async () => {
  const app = createApp();
  const server = app.listen(0);

  try {
    const address = server.address();
    const port = typeof address === 'object' && address ? address.port : 0;
    const response = await fetch(`http://127.0.0.1:${port}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'teacher@classbridge.test', password: 'password123' }),
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.email, 'teacher@classbridge.test');
    assert.equal(body.role, 'teacher');
  } finally {
    server.close();
  }
});

test('POST /api/lessons/:id/submit updates lesson status', async () => {
  const app = createApp();
  const server = app.listen(0);

  try {
    const address = server.address();
    const port = typeof address === 'object' && address ? address.port : 0;
    const response = await fetch(`http://127.0.0.1:${port}/api/lessons/l1/submit`, { method: 'POST' });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.status, 'submitted');
  } finally {
    server.close();
  }
});

test('POST /api/submissions creates a student submission', async () => {
  const app = createApp();
  const server = app.listen(0);

  try {
    const address = server.address();
    const port = typeof address === 'object' && address ? address.port : 0;
    const response = await fetch(`http://127.0.0.1:${port}/api/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assignmentId: 'a999',
        assignmentTitle: 'New Assignment',
        studentId: 'u999',
        studentName: 'Test Student',
        classId: 'c999',
        answer: 'Working submission',
      }),
    });
    const body = await response.json();

    assert.equal(response.status, 201);
    assert.equal(body.answer, 'Working submission');
    assert.equal(body.status, 'submitted');
  } finally {
    server.close();
  }
});

test('POST /api/assignments accepts file attachments', async () => {
  const app = createApp();
  const server = app.listen(0);

  try {
    const address = server.address();
    const port = typeof address === 'object' && address ? address.port : 0;
    const formData = new FormData();
    formData.append('classId', 'c1');
    formData.append('className', 'JHS 2 Integrated Science');
    formData.append('teacherId', 'u1');
    formData.append('teacherName', 'Mr. Kwame Asante');
    formData.append('title', 'Attachment assignment');
    formData.append('description', 'Please review the attached notes');
    formData.append('totalMarks', '25');
    formData.append('dueDate', '2026-07-10');
    formData.append('attachments', new File(['demo file contents'], 'notes.pdf', { type: 'application/pdf' }));

    const response = await fetch(`http://127.0.0.1:${port}/api/assignments`, {
      method: 'POST',
      body: formData,
    });
    const body = await response.json();

    assert.equal(response.status, 201);
    assert.equal(body.attachments[0].name, 'notes.pdf');
    assert.equal(body.attachments[0].type, 'application/pdf');
  } finally {
    server.close();
  }
});

test('POST /api/submissions accepts file attachments', async () => {
  const app = createApp();
  const server = app.listen(0);

  try {
    const address = server.address();
    const port = typeof address === 'object' && address ? address.port : 0;
    const formData = new FormData();
    formData.append('assignmentId', 'a9999');
    formData.append('assignmentTitle', 'Photosynthesis Diagram');
    formData.append('studentId', 'u9999');
    formData.append('studentName', 'Ama Serwaa');
    formData.append('classId', 'c1');
    formData.append('answer', 'I attached my completed work');
    formData.append('attachments', new File(['image bytes'], 'work.png', { type: 'image/png' }));

    const response = await fetch(`http://127.0.0.1:${port}/api/submissions`, {
      method: 'POST',
      body: formData,
    });
    const body = await response.json();

    assert.equal(response.status, 201);
    assert.equal(body.attachments[0].name, 'work.png');
    assert.equal(body.attachments[0].type, 'image/png');
  } finally {
    server.close();
  }
});

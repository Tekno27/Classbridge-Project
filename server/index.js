import express from 'express';
import cors from 'cors';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/auth/me', (_req, res) => {
    res.json({
      id: 'u1',
      name: 'Mr. Kwame Asante',
      email: 'teacher@classbridge.test',
      role: 'teacher',
      avatar: '',
    });
  });

  app.get('/api/classes', (_req, res) => {
    res.json([
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
    ]);
  });

  app.get('/api/lessons', (_req, res) => {
    res.json([
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
    ]);
  });

  app.get('/api/assignments', (_req, res) => {
    res.json([
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
    ]);
  });

  app.get('/api/submissions', (_req, res) => {
    res.json([
      {
        id: 's1',
        assignmentId: 'a1',
        assignmentTitle: 'Photosynthesis Diagram',
        studentId: 'u2',
        studentName: 'Ama Serwaa',
        classId: 'c1',
        answer: 'Sample submission',
        score: 18,
        feedback: 'Great work',
        status: 'graded',
        submittedAt: '2026-06-26T15:30:00Z',
      },
    ]);
  });

  return app;
}

if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 5000;
  const app = createApp();
  app.listen(port, () => {
    console.log(`Classbridge API listening on port ${port}`);
  });
}

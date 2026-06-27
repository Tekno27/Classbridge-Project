export function notifyUsers(db, userIds, { title, detail }) {
  const uniqueIds = [...new Set(userIds.filter(Boolean))];
  uniqueIds.forEach((userId) => {
    db.createNotification({ userId, title, detail });
  });
}

export function notifyHeadteachers(db, { title, detail }) {
  const headteachers = db.getUsers().filter((u) => u.role === 'headteacher');
  notifyUsers(db, headteachers.map((u) => u.id), { title, detail });
}

export function notifyClassStudents(db, classId, { title, detail }, excludeUserId) {
  const targetClass = db.getClasses().find((c) => c.id === classId);
  if (!targetClass) return;
  const studentIds = targetClass.students.filter((id) => id !== excludeUserId);
  notifyUsers(db, studentIds, { title, detail });
}

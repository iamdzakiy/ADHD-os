export async function addTask(task) {
  const res = await fetch('/api/calendar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  });
  if (!res.ok) throw new Error('Failed to add task');
  return res.json();
}

export async function getTasks(userId) {
  const res = await fetch(`/api/calendar?userId=${userId}`);
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
}
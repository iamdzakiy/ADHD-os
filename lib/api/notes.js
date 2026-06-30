import { adminDb } from '@/lib/firebase';

export async function addNote({ title, content, userId, tags = [], date }) {
  const res = await fetch('/api/brain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content, userId, tags, date }),
  });
  if (!res.ok) throw new Error('Failed to save note');
  return res.json();
}

export async function getNotes(userId) {
  const res = await fetch(`/api/brain?userId=${userId}`);
  if (!res.ok) throw new Error('Failed to fetch notes');
  return res.json();
}
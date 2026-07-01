import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(req) {
  try {
    const { title, content, userId, tags, date } = await req.json();
    const ref = adminDb.collection('users').doc(userId).collection('notes').doc();
    await ref.set({
      title,
      content,
      tags: tags || [],
      date: date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ success: true, id: ref.id });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

  const snapshot = await adminDb.collection('users').doc(userId).collection('notes')
    .orderBy('createdAt', 'desc')
    .limit(50)
    .get();
  
  const notes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json(notes);
}
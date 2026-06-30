import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase';

export async function POST(req) {
  try {
    const { userId, encryptedData, title, category } = await req.json();
    
    const ref = adminDb.collection('vault').doc(userId);
    await ref.set({
      entries: admin.firestore.FieldValue.arrayUnion({
        id: Date.now().toString(),
        title,
        category,
        encryptedData, // Already encrypted client-side
        updatedAt: new Date().toISOString(),
      })
    }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

  const doc = await adminDb.collection('vault').doc(userId).get();
  if (!doc.exists) {
    return NextResponse.json({ entries: [] });
  }
  return NextResponse.json(doc.data());
}
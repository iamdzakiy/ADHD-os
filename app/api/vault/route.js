import { NextResponse } from 'next/server';
// FIX: Import admin along with adminDb
import admin, { adminDb } from '@/lib/firebase';

export async function POST(req) {
  try {
    const { userId, encryptedData, title, category } = await req.json();
    
    const ref = adminDb.collection('vault').doc(userId);
    await ref.set({
      // Now admin.firestore.FieldValue is correctly defined
      entries: admin.firestore.FieldValue.arrayUnion({
        id: Date.now().toString(),
        title,
        category,
        encryptedData,
        updatedAt: new Date().toISOString(),
      })
    }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ... keep the GET function as is
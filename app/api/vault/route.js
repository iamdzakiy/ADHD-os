import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import CryptoJS from 'crypto-js';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const snap = await adminDb.collection('users').doc(userId).collection('vault').get();
  return NextResponse.json({ data: snap.docs.map(d => ({ id: d.id, ...d.data() })) });
}

export async function POST(req) {
  const { userId, title, username, password, masterKey } = await req.json();
  
  // Enkripsi AES-256 sebelum masuk ke database
  const encUser = CryptoJS.AES.encrypt(username, masterKey).toString();
  const encPass = CryptoJS.AES.encrypt(password, masterKey).toString();

  await adminDb.collection('users').doc(userId).collection('vault').add({
    title,
    username: encUser,
    password: encPass,
    createdAt: new Date().toISOString()
  });
  return NextResponse.json({ success: true });
}
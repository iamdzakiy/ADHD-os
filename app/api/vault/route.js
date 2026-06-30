import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase';
import CryptoJS from 'crypto-js';

// GET: Ambil data (Tetap terenkripsi dari DB)
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const snapshot = await adminDb.collection('vaults').doc(userId).collection('items').get();
  const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json({ items });
}

// POST: Simpan data dengan enkripsi
export async function POST(req) {
  try {
    const { userId, title, username, password, masterKey } = await req.json();
    
    // Enkripsi data sensitif menggunakan Master Key
    const encryptedUser = CryptoJS.AES.encrypt(username, masterKey).toString();
    const encryptedPass = CryptoJS.AES.encrypt(password, masterKey).toString();

    await adminDb.collection('vaults').doc(userId).collection('items').add({
      title,
      username: encryptedUser,
      password: encryptedPass,
      createdAt: new Date().toISOString()
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
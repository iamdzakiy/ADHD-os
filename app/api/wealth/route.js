import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  // 1. Ambil semua Akun (Aset & Utang)
  const accSnap = await adminDb.collection('users').doc(userId).collection('accounts').get();
  const accounts = accSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  
  // Hitung Net Worth (Aset - Utang)
  const totalAssets = accounts.filter(a => a.type !== 'loan').reduce((sum, a) => sum + (a.balance || 0), 0);
  const totalLiabilities = accounts.filter(a => a.type === 'loan').reduce((sum, a) => sum + (a.balance || 0), 0);
  const netWorth = totalAssets - totalLiabilities;

  // 2. Ambil Target Savings (Goals)
  const goalSnap = await adminDb.collection('users').doc(userId).collection('goals').get();
  const goals = goalSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  return NextResponse.json({ accounts, netWorth, totalAssets, totalLiabilities, goals });
}
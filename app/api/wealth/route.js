import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

  try {
    const accSnap = await adminDb.collection('users').doc(userId).collection('accounts').get();
    const accounts = accSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    const totalAssets = accounts.filter(a => a.type !== 'debt' && a.type !== 'loan').reduce((sum, a) => sum + (a.balance || 0), 0);
    const totalDebt = accounts.filter(a => a.type === 'debt' || a.type === 'loan').reduce((sum, a) => sum + (a.balance || 0), 0);
    
    const goalSnap = await adminDb.collection('users').doc(userId).collection('goals').get();
    const goals = goalSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    return NextResponse.json({ accounts, goals, totalAssets, totalDebt, netWorth: totalAssets - totalDebt });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// FIX: TAMBAHKAN POST METHOD AGAR BISA SIMPAN ACCOUNTS & GOALS
export async function POST(req) {
  const { userId, collection, data } = await req.json();
  if (!userId || !collection || !data) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  try {
    const ref = await adminDb.collection('users').doc(userId).collection(collection).add({
      ...data,
      createdAt: new Date().toISOString()
    });
    return NextResponse.json({ success: true, id: ref.id });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
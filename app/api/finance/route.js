import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const type = searchParams.get('type') || 'transactions'; 

  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

  try {
    if (type === 'transactions') {
      const month = searchParams.get('month');
      const year = searchParams.get('year');
      let query = adminDb.collection('users').doc(userId).collection('transactions');
      
      if (month && year) {
        const start = new Date(year, month - 1, 1).toISOString();
        const end = new Date(year, month, 0, 23, 59, 59).toISOString();
        query = query.where('date', '>=', start).where('date', '<=', end);
      }
      const snap = await query.orderBy('date', 'desc').get();
      return NextResponse.json({ data: snap.docs.map(d => ({ id: d.id, ...d.data() })) });
    } 
    
    if (type === 'accounts') {
      const snap = await adminDb.collection('users').doc(userId).collection('accounts').get();
      const accounts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Hitung Net Worth: Aset - Utang
      const netWorth = accounts.reduce((acc, curr) => acc + (curr.type === 'liability' ? -curr.balance : curr.balance), 0);
      return NextResponse.json({ data: accounts, netWorth });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

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
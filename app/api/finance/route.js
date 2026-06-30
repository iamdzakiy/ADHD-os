import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase';
import Papa from 'papaparse';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const userId = formData.get('userId');

    if (file) {
      // CSV IMPORT
      const text = await file.text();
      const result = Papa.parse(text, { header: true, skipEmptyLines: true });
      const transactions = result.data.map(row => ({
        date: row.Date || row.date || new Date().toISOString().split('T')[0],
        description: row.Description || row.description || 'Imported',
        category: row.Category || row.category || 'Uncategorized',
        type: row.Type || row.type || 'Expense',
        amount: parseFloat(row.Amount || row.amount || 0),
        account: row.Account || row.account || '',
        userId,
        createdAt: new Date().toISOString(),
      })).filter(tx => tx.amount > 0);

      const batch = adminDb.batch();
      transactions.forEach(tx => {
        const ref = adminDb.collection('transactions').doc();
        batch.set(ref, tx);
      });
      await batch.commit();
      return NextResponse.json({ success: true, count: transactions.length });
    } else {
      // MANUAL ADD
      const body = await req.json();
      const ref = adminDb.collection('transactions').doc();
      await ref.set({ ...body, createdAt: new Date().toISOString() });
      return NextResponse.json({ success: true, id: ref.id });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

  const snapshot = await adminDb.collection('transactions')
    .where('userId', '==', userId)
    .orderBy('date', 'desc')
    .limit(100)
    .get();
  
  const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json(transactions);
}
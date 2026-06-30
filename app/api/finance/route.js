import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const month = searchParams.get('month'); // 1-12
    const year = searchParams.get('year');   // misal: 2025

    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

    let query = adminDb.collection('transactions').where('userId', '==', userId);

    // LOGIKA FILTER BULAN & TAHUN
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1).toISOString();
      const endDate = new Date(parseInt(year), parseInt(month), 1).toISOString();
      
      query = query
        .where('date', '>=', startDate)
        .where('date', '<', endDate);
    }

    const snapshot = await query.orderBy('date', 'desc').get();
    const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ transactions });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST untuk menambah transaksi manual
export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, type, amount, description, category, date } = body;
    
    await adminDb.collection('transactions').add({
      userId, type, amount: parseFloat(amount), description, 
      category: category || 'Lainnya', date: date || new Date().toISOString()
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

const generateMonthlyReport = () => {
  // Ambil data transaksi bulan ini (dari state kamu)
  const reportData = `
    <html>
      <head><title>Laporan Keuangan ADHD OS</title></head>
      <body style="font-family: sans-serif; padding: 40px;">
        <h1>Laporan Bulan: ${selectedMonth} ${selectedYear}</h1>
        <h3>Total Pemasukan: Rp ${totalIncome.toLocaleString()}</h3>
        <h3>Total Pengeluaran: Rp ${totalExpense.toLocaleString()}</h3>
        <h3>Net Cashflow: Rp ${netCashflow.toLocaleString()}</h3>
        <hr/>
        <h2>Detail Transaksi</h2>
        <table border="1" cellpadding="5" style="width:100%; border-collapse: collapse;">
          <tr><th>Tanggal</th><th>Deskripsi</th><th>Kategori</th><th>Jumlah</th></tr>
          ${transactions.map(t => `
            <tr>
              <td>${new Date(t.date).toLocaleDateString()}</td>
              <td>${t.description}</td>
              <td>${t.category}</td>
              <td style="color: ${t.type === 'income' ? 'green' : 'red'}">
                Rp ${t.amount.toLocaleString()}
              </td>
            </tr>
          `).join('')}
        </table>
      </body>
    </html>
  `;
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(reportData);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => { printWindow.print(); }, 500);
};
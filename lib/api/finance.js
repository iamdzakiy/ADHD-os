import Papa from 'papaparse';

const handleCSVUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: async (results) => {
      // Mapping kolom CSV (Sesuaikan dengan format CSV bank kamu)
      const transactions = results.data.map(row => {
        // Contoh format umum mutasi bank:
        const date = row['Tanggal'] || row['Date'];
        const description = row['Keterangan'] || row['Description'];
        const debit = parseFloat(row['Debit'] || row['Mutasi (DB)'] || 0);
        const credit = parseFloat(row['Kredit'] || row['Mutasi (CR)'] || 0);

        return {
          userId: user.uid,
          date: new Date(date).toISOString(),
          description: description,
          amount: debit > 0 ? debit : credit,
          type: debit > 0 ? 'expense' : 'income', // Debit = Keluar, Kredit = Masuk
          category: 'Imported CSV'
        };
      }).filter(t => t.description); // Buang baris kosong

      // Kirim semua data ke backend sekaligus (Bulk Insert)
      await fetch('/api/finance/bulk', { // Kamu perlu membuat endpoint bulk POST
        method: 'POST',
        body: JSON.stringify({ transactions })
      });
      
      alert(`${transactions.length} transaksi berhasil diimpor!`);
      fetchTransactions(); // Refresh tampilan
    }
  });
};

// Di JSX, tambahkan tombol ini:
// <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" id="csv-upload" />
// <label htmlFor="csv-upload" className="cursor-pointer bg-blue-600 px-4 py-2 rounded">Import CSV</label>

export async function addTransaction(transaction) {
  const res = await fetch('/api/finance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transaction),
  });
  if (!res.ok) throw new Error('Failed to add transaction');
  return res.json();
}

export async function getTransactions(userId) {
  const res = await fetch(`/api/finance?userId=${userId}`);
  if (!res.ok) throw new Error('Failed to fetch transactions');
  return res.json();
}

export async function importCSV(file, userId) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', userId);
  const res = await fetch('/api/finance', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to import CSV');
  return res.json();
}
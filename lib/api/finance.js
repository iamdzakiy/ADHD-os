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
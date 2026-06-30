import * as admin from 'firebase-admin';

export const recalculateFinanceHealth = async (userId: string) => {
  const transactionsSnapshot = await admin.firestore()
    .collection('users').doc(userId).collection('transactions').get();
  
  let totalIncome = 0, totalExpenses = 0;
  transactionsSnapshot.docs.forEach(doc => {
    const data = doc.data();
    if (data.type === 'Income') totalIncome += data.amount || 0;
    else totalExpenses += data.amount || 0;
  });

  const savingsRate = totalIncome > 0 ? (totalIncome - totalExpenses) / totalIncome : 0;
  const score = Math.min(100, Math.max(0, 40 + (savingsRate * 200)));

  await admin.firestore().collection('users').doc(userId).set({
    healthScore: Math.round(score),
    savingsRate: savingsRate,
    totalIncome,
    totalExpenses,
    netWorth: totalIncome - totalExpenses,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
};
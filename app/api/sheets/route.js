import { NextResponse } from 'next/server';
import { google } from 'googleapis';

const auth = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);
auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID; // Wajib diisi di .env

export async function POST(req) {
  try {
    const { transactions } = await req.json();
    if (!transactions || transactions.length === 0) {
      return NextResponse.json({ error: 'No transactions to sync' }, { status: 400 });
    }

    // Format data untuk Google Sheets
    const rows = transactions.map(t => [
      new Date(t.date).toLocaleDateString('id-ID'), 
      t.description, 
      t.category, 
      t.type, 
      t.amount
    ]);

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:E',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: { values: rows },
    });

    return NextResponse.json({ success: true, synced: rows.length });
  } catch (error) {
    console.error('Sheets Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
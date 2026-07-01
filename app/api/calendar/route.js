import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(req) {
  try {
    const { summary, start, end, description } = await req.json();
    
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

    const calendar = google.calendar({ version: 'v3', auth });
    
    const event = {
      summary: summary || 'Focus Time',
      description: description || 'Scheduled via ADHD OS',
      start: { dateTime: start, timeZone: 'Asia/Jakarta' },
      end: { dateTime: end, timeZone: 'Asia/Jakarta' },
    };

    const res = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });

    return NextResponse.json({ success: true, eventId: res.data.id });
  } catch (error) {
    console.error('Calendar Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
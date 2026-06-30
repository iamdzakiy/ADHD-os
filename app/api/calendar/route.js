import { NextResponse } from 'next/server';
import { google } from 'googleapis';

// In production, store these in Firestore per user.
// For brevity, using env vars for a single user demo.
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Set refresh token from your stored credentials
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

export async function POST(req) {
  try {
    const { task, userId } = await req.json();
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // 1. Get Free Busy slots for tomorrow
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(tomorrow.getDate() + 1);

    const freeBusy = await calendar.freebusy.query({
      requestBody: {
        timeMin: tomorrow.toISOString(),
        timeMax: dayAfter.toISOString(),
        items: [{ id: 'primary' }],
      },
    });

    const busySlots = freeBusy.data.calendars.primary.busy || [];
    // Find first 2-hour slot from 9 AM to 5 PM
    let startTime = new Date(tomorrow);
    startTime.setHours(9, 0, 0, 0);
    const endTime = new Date(tomorrow);
    endTime.setHours(17, 0, 0, 0);

    let foundSlot = false;
    while (startTime < endTime) {
      const slotEnd = new Date(startTime);
      slotEnd.setHours(startTime.getHours() + 2);
      
      const isBusy = busySlots.some(busy => {
        const busyStart = new Date(busy.start);
        const busyEnd = new Date(busy.end);
        return (startTime < busyEnd && slotEnd > busyStart);
      });

      if (!isBusy) {
        foundSlot = true;
        break;
      }
      startTime.setHours(startTime.getHours() + 1);
    }

    if (!foundSlot) {
      return NextResponse.json({ error: 'No free slot found' }, { status: 404 });
    }

    // 2. Insert Event
    const eventEnd = new Date(startTime);
    eventEnd.setHours(startTime.getHours() + 2);

    const event = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: `🧠 ADHD Block: ${task.title || 'Deep Work'}`,
        description: `Auto-scheduled by ADHD OS. Priority task.`,
        start: { dateTime: startTime.toISOString(), timeZone: 'Asia/Jakarta' },
        end: { dateTime: eventEnd.toISOString(), timeZone: 'Asia/Jakarta' },
        colorId: '2',
        reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 10 }] },
      },
    });

    return NextResponse.json({ success: true, event: event.data });
  } catch (error) {
    console.error('Calendar error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
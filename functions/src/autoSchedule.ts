import * as admin from 'firebase-admin';
import { google } from 'googleapis';

// In production, fetch the user's refresh token from Firestore.
// For demo, using env variable.
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

export const autoScheduleTask = async (task: any, userId: string) => {
  try {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Get free slots for tomorrow
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

    const busySlots = freeBusy.data.calendars?.primary?.busy || [];
    let startTime = new Date(tomorrow);
    startTime.setHours(9, 0, 0, 0);
    const endTime = new Date(tomorrow);
    endTime.setHours(17, 0, 0, 0);

    let foundSlot = false;
    while (startTime < endTime) {
      const slotEnd = new Date(startTime);
      slotEnd.setHours(startTime.getHours() + 2);
      
      const isBusy = busySlots.some((busy: any) => {
        const busyStart = new Date(busy.start);
        const busyEnd = new Date(busy.end);
        return (startTime < busyEnd && slotEnd > busyStart);
      });

      if (!isBusy) { foundSlot = true; break; }
      startTime.setHours(startTime.getHours() + 1);
    }

    if (!foundSlot) {
      console.log('No free slot found for user:', userId);
      return;
    }

    const eventEnd = new Date(startTime);
    eventEnd.setHours(startTime.getHours() + 2);

    await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: `🧠 Auto-Block: ${task.title || 'Deep Work'}`,
        description: `Scheduled by ADHD OS for user ${userId}`,
        start: { dateTime: startTime.toISOString(), timeZone: 'Asia/Jakarta' },
        end: { dateTime: eventEnd.toISOString(), timeZone: 'Asia/Jakarta' },
        colorId: '2',
      },
    });

    // Mark task as scheduled in Firestore
    await admin.firestore()
      .collection('users').doc(userId).collection('tasks')
      .doc(task.id || task._id)
      .update({ scheduled: true, scheduledTime: startTime.toISOString() });

  } catch (error) {
    console.error('Auto-schedule error:', error);
  }
};
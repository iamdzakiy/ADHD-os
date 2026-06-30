import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { content, date, userId } = await req.json();
    const CAPACITIES_API_KEY = process.env.CAPACITIES_API_KEY;

    if (!CAPACITIES_API_KEY) {
      return NextResponse.json({ error: 'Capacities API key missing' }, { status: 500 });
    }

    const dailyNoteDate = date || new Date().toISOString().split('T')[0];
    
    // 1. Try to get existing daily note
    let objectId = null;
    const getRes = await fetch(
      `https://api.capacities.io/v1/daily-note/${dailyNoteDate}`,
      {
        headers: {
          'Authorization': `Bearer ${CAPACITIES_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (getRes.status === 404) {
      // Create new daily note
      const createRes = await fetch('https://api.capacities.io/v1/objects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CAPACITIES_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'note',
          title: `Daily Log ${dailyNoteDate}`,
          properties: { 'date': dailyNoteDate },
          markdown: `# Daily Log ${dailyNoteDate}\n\n## ADHD OS Sync\n${content}\n\n---`,
        }),
      });
      const data = await createRes.json();
      objectId = data.objectId;
    } else {
      const dailyNote = await getRes.json();
      objectId = dailyNote.objectId;
      
      // Append to existing
      const currentRes = await fetch(`https://api.capacities.io/v1/objects/${objectId}`);
      const current = await currentRes.json();
      const updatedMarkdown = current.markdown + `\n\n### ⚡ ADHD OS Capture (${new Date().toLocaleTimeString()})\n${content}`;
      
      await fetch(`https://api.capacities.io/v1/objects/${objectId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${CAPACITIES_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ markdown: updatedMarkdown }),
      });
    }

    return NextResponse.json({ success: true, objectId });
  } catch (error) {
    console.error('Capacities error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
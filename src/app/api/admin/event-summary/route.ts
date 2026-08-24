import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getGoogleClient } from '@/lib/google-auth';
import { google } from 'googleapis';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { eventId } = await req.json();
    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required.' }, { status: 400 });
    }

    const masterSheetId = process.env.MASTER_AUTH_SHEET_ID;
    if (!masterSheetId) {
      return NextResponse.json({ error: 'Master sheet not configured.' }, { status: 500 });
    }

    const authClient = await getGoogleClient();
    if (!authClient) {
      return NextResponse.json({ error: 'Google credentials not configured.' }, { status: 500 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sheets = google.sheets({ version: 'v4', auth: authClient as any });

    // Find the event in master sheet
    const masterRes = await sheets.spreadsheets.values.get({
      spreadsheetId: masterSheetId,
      range: 'Sheet1!A:I',
    });

    const masterRows = masterRes.data.values || [];
    let targetSheetId = '';
    let eventName = '';
    for (let i = 1; i < masterRows.length; i++) {
      if (masterRows[i][0] === eventId) {
        eventName = masterRows[i][1] || 'Unknown Event';
        targetSheetId = masterRows[i][4] || '';
        break;
      }
    }

    if (!targetSheetId) {
      return NextResponse.json({ error: 'Event not found or no target sheet.' }, { status: 404 });
    }

    // Read ALL rows from the target sheet
    let leadData: string[][] = [];
    try {
      const leadRes = await sheets.spreadsheets.values.get({
        spreadsheetId: targetSheetId,
        range: 'Sheet1!A:J',
      });
      leadData = leadRes.data.values || [];
    } catch {
      return NextResponse.json({ totalLeads: 0, totalNumbers: 0 });
    }

    if (leadData.length <= 1) {
      return NextResponse.json({ totalLeads: 0, totalNumbers: 0 });
    }

    // Build a text representation for the AI
    
    const headers = leadData[0].map(h => h.toLowerCase());
    const dataRows = leadData.slice(1);
    const phoneIdx = headers.findIndex(h => h.includes('phone') || h.includes('mobile'));
    let totalNumbers = 0;
    if (phoneIdx !== -1) {
      for (const row of dataRows) {
        if (row[phoneIdx] && row[phoneIdx].trim() !== '') totalNumbers++;
      }
    }
    return NextResponse.json({ totalLeads: dataRows.length, totalNumbers });

  } catch (error) {
    console.error('Event summary error:', error);
    return NextResponse.json({ error: 'Failed to generate summary.' }, { status: 500 });
  }
}

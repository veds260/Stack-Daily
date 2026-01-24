import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { db } from '@/lib/db';
import { submissions } from '@/lib/db/schema';

const HEADERS = [
  'Timestamp',
  'Name',
  'Telegram',
  'X Profile',
  'Expertise',
  'Experience Level',
  'Monthly Rate',
  'Biggest Win',
  'Portfolio'
];

async function getAuthClient() {
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT;
  if (!credentials) return null;

  try {
    const parsed = JSON.parse(Buffer.from(credentials, 'base64').toString());
    const auth = new google.auth.GoogleAuth({
      credentials: parsed,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    return auth;
  } catch {
    console.error('Failed to parse Google credentials');
    return null;
  }
}

async function ensureHeaders(sheets: ReturnType<typeof google.sheets>, spreadsheetId: string) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A1:I1',
  });

  const firstRow = response.data.values?.[0];
  if (!firstRow || firstRow.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Sheet1!A1:I1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [HEADERS],
      },
    });
  }
}

async function saveToDatabase(data: {
  name: string;
  telegram: string;
  xProfile: string;
  expertise: string[];
  experienceLevel: string;
  monthlyRate: string;
  biggestWin: string;
  portfolio: string;
}) {
  if (!db) return;

  try {
    await db.insert(submissions).values({
      name: data.name,
      telegram: data.telegram,
      xProfile: data.xProfile,
      expertise: data.expertise.join(', '),
      experienceLevel: data.experienceLevel,
      monthlyRate: data.monthlyRate || null,
      biggestWin: data.biggestWin,
      portfolio: data.portfolio || null,
    });
  } catch (error) {
    console.error('Database save error:', error);
  }
}

async function saveToGoogleSheets(data: {
  name: string;
  telegram: string;
  xProfile: string;
  expertise: string[];
  experienceLevel: string;
  monthlyRate: string;
  biggestWin: string;
  portfolio: string;
}) {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const auth = await getAuthClient();

  if (!auth || !spreadsheetId) return;

  try {
    const sheets = google.sheets({ version: 'v4', auth });
    await ensureHeaders(sheets, spreadsheetId);

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:I',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          new Date().toISOString(),
          data.name,
          data.telegram,
          data.xProfile,
          data.expertise.join(', '),
          data.experienceLevel,
          data.monthlyRate || 'N/A',
          data.biggestWin,
          data.portfolio || 'N/A',
        ]],
      },
    });
  } catch (error) {
    console.error('Google Sheets save error:', error);
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Save to both - database is the backup
    await Promise.all([
      saveToDatabase(data),
      saveToGoogleSheets(data),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

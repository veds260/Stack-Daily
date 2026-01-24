import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { google } from 'googleapis';
import { db } from '@/lib/db';
import { submissions } from '@/lib/db/schema';
import {
  sanitizeDisplayString,
  sanitizeUsername,
  sanitizeUrl,
  validateArrayValues,
  validateAllowedValue,
  checkRateLimit,
} from '@/lib/security';
import { EXPERTISE_OPTIONS, EXPERIENCE_OPTIONS, MONTHLY_RATE_OPTIONS } from '@/app/types';

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

// Extract allowed values from options
const ALLOWED_EXPERTISE = EXPERTISE_OPTIONS.map(opt => opt);
const ALLOWED_EXPERIENCE = EXPERIENCE_OPTIONS.map(opt => opt.value);
const ALLOWED_MONTHLY_RATE = MONTHLY_RATE_OPTIONS.map(opt => opt.value);

interface ValidatedData {
  name: string;
  telegram: string;
  xProfile: string;
  expertise: string[];
  experienceLevel: string;
  monthlyRate: string;
  biggestWin: string;
  portfolio: string;
}

function validateAndSanitizeInput(data: unknown): ValidatedData | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const input = data as Record<string, unknown>;

  // Required fields validation
  const name = sanitizeDisplayString(input.name, 100);
  const telegram = sanitizeUsername(input.telegram, 50);
  const xProfile = sanitizeDisplayString(input.xProfile, 200);
  const biggestWin = sanitizeDisplayString(input.biggestWin, 1000);

  if (!name || !telegram || !xProfile || !biggestWin) {
    return null;
  }

  // Validate against allowed values
  const expertise = validateArrayValues(input.expertise, ALLOWED_EXPERTISE);
  const experienceLevel = validateAllowedValue(input.experienceLevel, ALLOWED_EXPERIENCE);

  if (expertise.length === 0 || !experienceLevel) {
    return null;
  }

  // Optional fields
  const monthlyRate = validateAllowedValue(input.monthlyRate, ALLOWED_MONTHLY_RATE);
  const portfolio = sanitizeUrl(input.portfolio);

  return {
    name,
    telegram,
    xProfile,
    expertise,
    experienceLevel,
    monthlyRate,
    biggestWin,
    portfolio,
  };
}

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

async function saveToDatabase(data: ValidatedData) {
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

async function saveToGoogleSheets(data: ValidatedData) {
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
    // Rate limiting
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for')?.split(',')[0] ||
               headersList.get('x-real-ip') ||
               'unknown';

    if (!checkRateLimit(ip, 5, 60000)) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse and validate input
    let rawData: unknown;
    try {
      rawData = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const data = validateAndSanitizeInput(rawData);

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing required fields' },
        { status: 400 }
      );
    }

    // Save to both - database is the backup
    await Promise.all([
      saveToDatabase(data),
      saveToGoogleSheets(data),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

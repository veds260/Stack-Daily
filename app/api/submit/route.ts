import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { google } from 'googleapis';
import { db } from '@/lib/db';
import { submissions } from '@/lib/db/schema';
import {
  sanitizeDisplayString,
  sanitizeUsername,
  sanitizeUrl,
  checkRateLimit,
} from '@/lib/security';
import { encrypt } from '@/lib/encryption';
import { EXPERIENCE_OPTIONS, MONTHLY_RATE_OPTIONS } from '@/app/types';

const HEADERS = [
  'Date',
  'Name',
  'Telegram',
  'X Profile',
  'Skills',
  'Experience',
  'Monthly Rate',
  'Biggest Win',
  'Portfolio'
];

// Maps for readable labels
const EXPERIENCE_LABELS: Record<string, string> = {
  'beginner': 'Beginner (less than a year)',
  'intermediate': 'Intermediate (1-2 years)',
  'advanced': 'Advanced (3-5 years)',
  'expert': 'Expert (5+ years)',
};

const RATE_LABELS: Record<string, string> = {
  'under-500': 'Under $500',
  '500-1000': '$500 - $1,000',
  '1000-2000': '$1,000 - $2,000',
  '2000-2500': '$2,000 - $2,500',
};

interface ValidatedData {
  name: string;
  telegram: string;
  xProfile: string;
  expertise: string[];
  otherExpertise: string;
  experienceLevel: string;
  otherExperience: string;
  monthlyRate: string;
  otherMonthlyRate: string;
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

  // Expertise - array of skills + optional other
  let expertise: string[] = [];
  if (Array.isArray(input.expertise)) {
    expertise = input.expertise
      .filter((s): s is string => typeof s === 'string')
      .map(s => sanitizeDisplayString(s, 100))
      .filter((s): s is string => s !== null);
  }
  const otherExpertise = sanitizeDisplayString(input.otherExpertise, 200) || '';

  // Need at least one skill (from list or other)
  if (expertise.length === 0 && !otherExpertise) {
    return null;
  }

  // Experience level
  const experienceLevel = sanitizeDisplayString(input.experienceLevel, 50) || '';
  const otherExperience = sanitizeDisplayString(input.otherExperience, 200) || '';

  if (!experienceLevel) {
    return null;
  }

  // Monthly rate
  const monthlyRate = sanitizeDisplayString(input.monthlyRate, 50) || '';
  const otherMonthlyRate = sanitizeDisplayString(input.otherMonthlyRate, 200) || '';

  // Portfolio (optional)
  const portfolio = sanitizeUrl(input.portfolio);

  return {
    name,
    telegram,
    xProfile,
    expertise,
    otherExpertise,
    experienceLevel,
    otherExperience,
    monthlyRate,
    otherMonthlyRate,
    biggestWin,
    portfolio,
  };
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getExperienceLabel(value: string, other: string): string {
  if (value === 'other' && other) {
    return other;
  }
  return EXPERIENCE_LABELS[value] || value;
}

function getRateLabel(value: string, other: string): string {
  if (value === 'other' && other) {
    return other;
  }
  return RATE_LABELS[value] || value || 'Not specified';
}

function getSkillsList(skills: string[], other: string): string {
  const allSkills = [...skills];
  if (other) {
    allSkills.push(other);
  }
  return allSkills.join(', ');
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
      telegram: encrypt(data.telegram),
      xProfile: encrypt(data.xProfile),
      expertise: getSkillsList(data.expertise, data.otherExpertise),
      experienceLevel: getExperienceLabel(data.experienceLevel, data.otherExperience),
      monthlyRate: getRateLabel(data.monthlyRate, data.otherMonthlyRate),
      biggestWin: data.biggestWin,
      portfolio: data.portfolio ? encrypt(data.portfolio) : null,
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
          formatDate(new Date()),
          data.name,
          `@${data.telegram}`,
          data.xProfile,
          getSkillsList(data.expertise, data.otherExpertise),
          getExperienceLabel(data.experienceLevel, data.otherExperience),
          getRateLabel(data.monthlyRate, data.otherMonthlyRate),
          data.biggestWin,
          data.portfolio || 'None',
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

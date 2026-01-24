import { NextResponse } from 'next/server';

// Google Sheets API endpoint (using Google Apps Script Web App)
// You'll need to create a Google Apps Script and deploy it as a web app
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // If Google Script URL is configured, send data there
    if (GOOGLE_SCRIPT_URL) {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          name: data.name,
          telegram: data.telegram,
          xProfile: data.xProfile,
          expertise: data.expertise.join(', '),
          experienceLevel: data.experienceLevel,
          monthlyRate: data.monthlyRate || 'N/A',
          biggestWin: data.biggestWin,
          portfolio: data.portfolio || 'N/A',
        }),
      });

      if (!response.ok) {
        console.error('Failed to submit to Google Sheets');
      }
    } else {
      // Log to console for testing
      console.log('Form submission (no Google Sheets configured):', data);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

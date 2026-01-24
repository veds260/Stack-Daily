import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { checkRateLimit, sanitizeUsername } from '@/lib/security';

export async function GET(request: Request) {
  // Rate limiting
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] ||
             headersList.get('x-real-ip') ||
             'unknown';

  if (!checkRateLimit(ip, 30, 60000)) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const rawUsername = searchParams.get('username');

  // Validate and sanitize username
  const username = sanitizeUsername(rawUsername, 50);

  if (!username) {
    return NextResponse.json({ error: 'Valid username required' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://unavatar.io/twitter/${username}`, {
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      throw new Error('Avatar fetch failed');
    }

    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch {
    // Return a fallback avatar
    try {
      const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=18181b&color=fff&size=128`;
      const fallbackResponse = await fetch(fallbackUrl, {
        signal: AbortSignal.timeout(5000),
      });
      const buffer = await fallbackResponse.arrayBuffer();

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    } catch {
      return NextResponse.json({ error: 'Failed to fetch avatar' }, { status: 500 });
    }
  }
}

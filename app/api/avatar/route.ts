import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username required' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://unavatar.io/twitter/${username}`);
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch {
    // Return a fallback avatar
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=18181b&color=fff&size=128`;
    const fallbackResponse = await fetch(fallbackUrl);
    const buffer = await fallbackResponse.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  }
}

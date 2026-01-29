export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new Response('Missing URL parameter', { status: 400 });
  }

  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    return new Response(blob, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('Failed to proxy image:', error);
    return new Response('Failed to fetch image', { status: 500 });
  }
}

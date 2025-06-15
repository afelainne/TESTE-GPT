import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { imageUrl } = await request.json();
  
  // 1) Verifique no log se a URL do CLIP está correta
  console.log('[find-similar] CLIP_API_URL=', process.env.CLIP_API_URL);

  // 2) Chamada ao endpoint correto de /api/predict do Space
  const resp = await fetch(process.env.CLIP_API_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: [imageUrl] }),
  });

  // 3) Fallback em qualquer erro de status
  if (!resp.ok) {
    console.warn('[find-similar] erro status', resp.status);
    return NextResponse.json({ similar: [] });
  }

  // 4) Parseie e extraia URLs ordenadas por score
  const { data } = await resp.json();
  const similar = (data[0] || [])
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 8)
    .map((item: any) => item.url);

  return NextResponse.json({ similar });
}
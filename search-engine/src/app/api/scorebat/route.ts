import { NextResponse } from 'next/server';

export async function GET() {
  const token = process.env.SCOREBAT_API_TOKEN;

  if (!token) {
    return NextResponse.json({ response: [] }, { status: 500 });
  }

  try {
    const res = await fetch(`https://www.scorebat.com/video-api/v3/feed/?token=${token}`);
    if (!res.ok) {
      return NextResponse.json({ response: [] }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Scorebat fetch error:", error);
    return NextResponse.json({ response: [] }, { status: 500 });
  }
}

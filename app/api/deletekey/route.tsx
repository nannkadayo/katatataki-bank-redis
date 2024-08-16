import * as redis from 'redis';
import { NextResponse, NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
  }

  const { key } = await req.json(); // Use req.json() to parse the request body

  if (!key) {
    return NextResponse.json({ message: 'Key is required' }, { status: 400 });
  }

  const client = redis.createClient();

  client.on('error', (err) => console.log('Redis Client Error', err));

  await client.connect();

  try {
    await client.del(key);
    return NextResponse.json({ message: "Key deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete key from Redis', error);
    return NextResponse.json({ message: "Failed to delete key from Redis" }, { status: 500 });
  } finally {
    await client.disconnect();
  }
}

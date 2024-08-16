import * as redis from 'redis';
import { NextResponse, NextRequest } from 'next/server';
import { headers } from 'next/headers';
export const corsHeaders = {
'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
'Pragma': 'no-cache',
'Expires': '0',
'Surrogate-Control': 'no-store'
};
export async function GET(req: NextRequest) {
  if (req.method !== 'GET') {
    return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
  }

  const client = redis.createClient();

  client.on('error', (err) => console.log('Redis Client Error', err));

  await client.connect();

  try {
    const keys = await client.keys('*');
    const values = await Promise.all(keys.map((key) => client.get(key)));
    const data = keys.map((key, index) => ({ key, value: values[index] }));

    return NextResponse.json({ data }, { status: 200 , headers: corsHeaders});
  } catch (error) {
    console.error('Failed to fetch data from Redis', error);

    return NextResponse.json({ message: "Failed to fetch data from Redis", error }, { status: 500 });
  } finally {
    await client.disconnect();
  }
}
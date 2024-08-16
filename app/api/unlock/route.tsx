import * as redis from 'redis';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
export async function POST(req: NextRequest) {
    const client = redis.createClient();

    client.on('error', err => console.log('Redis Client Error', err));

    await client.connect();
  // /[^a-zA-Z0-9]/
    try {
        const { key } = await req.json();
        if (!key) {
            return NextResponse.json({ message: 'Key is required' }, { status: 400 });
          }
        
        const found = JSON.parse(await client.get(key));
const foundse = found
if (!foundse.usedAt && foundse.ban){
    delete foundse.ban  
}else if(foundse.usedAt && !foundse.ban){
    delete foundse.usedAt
}else if(foundse.usedAt && foundse.ban){
        delete foundse.usedAt
            delete foundse.ban
}else{
    return NextResponse.json({ message: 'Key is not locked' }, { status: 400 });
}

        const updateResponse = await client.set(
            key,
            JSON.stringify({
               ...foundse
            })
        );
        if (updateResponse !== "OK") {
            return NextResponse.json({ 'errorMessage': "server error" }, { status: 500 });
        }
     
        return NextResponse.json({ 'message': `unlock successfully` }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ 'errorMessage': "server error" }, { status: 500 });
    } finally {
        await client.disconnect();
    }
}

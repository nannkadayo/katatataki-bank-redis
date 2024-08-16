import sha256 from 'crypto-js/sha256';
import * as redis from 'redis';
import { NextRequest, NextResponse } from 'next/server';

function hashSerialNumber(serialNumber: string, passCode: string): string {
    return serialNumber + sha256(`${passCode}:${process.env.SALT}`);
}

function generateId() {
    let key = '';
    const length = 15;
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        key += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return key;
}

export async function POST(req: NextRequest) {
    const client = redis.createClient();

    client.on('error', err => console.log('Redis Client Error', err));

    await client.connect();

    try {
        const data = await req.json();
        const number = data['number'];

        if (!number || number.toString() === '0' || number.toString().length <= 0 || number.toString().length >= 6 || !/^[0-9]+$/.test(number.toString())) {
            return NextResponse.json({ 'errorMessage': "回数は1回以上99999回以下にしてください" }, { status: 400 });
        }

        const expiredAt = data['expiredAt'];
        if (expiredAt && (expiredAt.toString().length !== 10 || !/^\d{4}-\d{2}-\d{2}$/.test(expiredAt))) {
            return NextResponse.json({ 'errorMessage': "有効期限はyyyy-mm-dd形式で入力してください" }, { status: 400 });
        }

        const passCode = data['passCode'];
        if (!passCode || passCode.toString().length !== 5 || !/^[0-9]+$/.test(passCode.toString())) {
            return NextResponse.json({ 'errorMessage': "パスコードは5桁の数字で入力してください" }, { status: 400 });
        }
        const memo = data['memo'];
        let key = generateId();
        let found = await client.get(key);

        while (found) {
            key = generateId();
            found = await client.get(key);
        }

        const createResponse = await client.set(
            key,
            JSON.stringify({
                hash: hashSerialNumber(key, passCode),
                expiredAt: expiredAt ? new Date(expiredAt).getTime() : null,
                number: number,
                passCode: passCode,
                memo: memo
                        })
        );

        if (createResponse !== "OK") {
            return NextResponse.json({ 'errorMessage': "何らかの理由で発行に失敗しました" }, { status: 500 });
        }

        return NextResponse.json({ 'serialNumber': key }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ 'errorMessage': "サーバーエラーが発生しました" }, { status: 500 });
    } finally {
        await client.disconnect();
    }
}

export async function PUT(req: NextRequest) {
    const client = redis.createClient();

    client.on('error', err => console.log('Redis Client Error', err));

    await client.connect();
  // /[^a-zA-Z0-9]/
    try {
        const data = await req.json();
        const serialNumber = data['serialNumber'];
        if (!serialNumber || serialNumber.toString().length !== 15 || !/^[a-zA-Z0-9]+$/.test(serialNumber.toString())){
            return NextResponse.json({ 'errorMessage': "シリアル番号は15桁の文字で入力してください" }, { status: 400 });
        }

        const passCode = data['passCode'];
        if (!passCode || passCode.toString().length !== 5 || !/^[0-9]+$/.test(passCode.toString())) {
            return NextResponse.json({ 'errorMessage': "パスコードは5桁の数字で入力してください" }, { status: 400 });
        }

        const found = JSON.parse(await client.get(serialNumber));
        if (!found) {
            return NextResponse.json({ 'errorMessage': "無効なシリアル番号です" }, { status: 404 });
        }

        const hash = hashSerialNumber(serialNumber, passCode);
        if (found['hash'] !== hash) {
            return NextResponse.json({ "errorMessage": "パスコードが違います" }, { status: 403 });
        }

        if (found['usedAt']) {
            return NextResponse.json({ 'message': "この券は既に利用されています" }, { status: 200 });
        }
        if (found['ban']) {
            return NextResponse.json({ 'errorMessage': `この券の利用は禁止されています` }, { status: 403 });
        }
        const now = new Date().getTime();
        const foundExpiredAt = found['expiredAt'];
        if (foundExpiredAt && now > foundExpiredAt) {
            return NextResponse.json({ 'message': "この券は有効期限が切れています" }, { status: 200 });
        }

        const updateResponse = await client.set(
            serialNumber,
            JSON.stringify({
                ...found,
                usedAt: new Date().getTime()
            })
        );

        if (updateResponse !== "OK") {
            return NextResponse.json({ 'errorMessage': "何らかの理由で確認に失敗しました" }, { status: 500 });
        }

        return NextResponse.json({ 'message': `${found['number']}回券が正常に利用されました
            memo:${found['memo']}
            ` }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ 'errorMessage': "サーバーエラーが発生しました" }, { status: 500 });
    } finally {
        await client.disconnect();
    }
}

import { and, asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { logs } from "~/server/db/schema";


export const dynamic = "force-dynamic";
export async function GET(request : Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const groupId = searchParams.get('groupId');

    if (!userId || !groupId) {
        return NextResponse.json({ message: 'groupId and teamName are required' }, { status: 400 });
    }

    try {
        const logDatas = await db.select({
            prevData: logs.prevData,
            inputData: logs.inputData,
            operation: logs.operation,
            dataType: logs.dataType,
        }).from(logs).where(and(eq(logs.userId, userId), eq(logs.groupId, groupId))).orderBy(asc(logs.createdAt));

        if (!logDatas) {
            return NextResponse.json({message: 'GroupId not found'}, {status: 404})
        }

        return NextResponse.json({logsDetails: logDatas}, {status: 200})
    } catch {
        return NextResponse.json({ message: 'Failed to get data related to the logs.' }, { status: 500 });
    }
}
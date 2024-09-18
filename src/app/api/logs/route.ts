import { db } from "~/server/db";
import { NextResponse } from "next/server";
import { logs } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const userId = url.searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ message: "User ID is required" }, { status: 400 });
        }

        const logDatas = await db.select({
                            groupId: logs.groupId,
                            operation: logs.operation,
                            dataType: logs.dataType,
                            createdAt: logs.createdAt,
                        }).from(logs).where(eq(logs.userId, userId))
        
        const groupMap = new Map<string, {groupId: string, operation: string, dataType: string, createdAt: Date }>();

        for (const logData of logDatas) {
            const { groupId, operation, dataType, createdAt } = logData; 
            
            if (groupMap.has(groupId)) {
                const smallestTimeStampLog = groupMap.get(groupId);
                if (smallestTimeStampLog && createdAt < smallestTimeStampLog.createdAt) {
                    groupMap.set(groupId, {groupId, operation, dataType, createdAt})
                }
            } else {
                groupMap.set(groupId, {groupId, operation, dataType, createdAt})
            }
        }

        const sortedResults = Array.from(groupMap.values()).sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        );

        return NextResponse.json({sortedResults: sortedResults}, {status: 200});

    } catch (error) {
        return NextResponse.json({message: 'Failed to fetch logs'}, {status: 500});
    }


}
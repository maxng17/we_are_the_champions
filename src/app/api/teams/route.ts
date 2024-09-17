import { db } from "~/server/db";
import { NextResponse } from "next/server";
import { teams } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
export async function POST(request: Request) {
    const {userIdInput, userData} = await request.json();
    if (!userIdInput || !Array.isArray(userData)) {
        return NextResponse.json({ error: request.body}, { status: 400 });
    }

    // Additional checks here
    for (const item of userData) {
        const teamName = item.name;
        const regDate = item.registrationDate;
        const groupNumber = item.groupNumber;
        await db.insert(teams).values({
            userId: userIdInput,
            name: teamName,
            group: groupNumber,
            totalScore: '0',
            wins: '0',
            losts: '0',
            draws: '0',
            regDate: regDate,
        })
    }

    return NextResponse.json({ message: 'ok' }, { status: 200 }); 
}

export async function GET(request: Request) {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
        return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    try {
        const teamRecords = await db.select({
            teamName: teams.name,
            registrationDate: teams.regDate,
            groupNumber: teams.group,
        }).from(teams).where(eq(teams.userId, userId));

        return NextResponse.json({ teams: teamRecords }, { status: 200 });
    } catch (error) {
        console.error('Error fetching teams:', error);
        return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
    }
}
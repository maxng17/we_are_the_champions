import { db } from "~/server/db";
import { NextResponse } from "next/server";
import { matches } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
export async function POST(request: Request) {
    const {userIdInput, userData} = await request.json();
    if (!userIdInput || !Array.isArray(userData)) {
        return NextResponse.json({ error: request.body}, { status: 400 });
    }

    //Additional checks here
    for (const item of userData) {
        const team1name = item.team1;
        const team2name = item.team2;
        const team1goals = item.score1;
        const team2goals = item.score2;
         
        await db.insert(matches).values({
            userId: userIdInput,
            team1goals:team1goals,
            team1name:team1name,
            team2goals:team2goals,
            team2name:team2name,
        })
    }

    return NextResponse.json({message: 'ok'}, {status: 200})
}

export async function GET(request: Request) {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
        return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    try {
        const matchesRecords = await db.select({
            team1name: matches.team1name,
            team2name: matches.team2name,
            team1goals: matches.team1goals,
            team2goals: matches.team2goals,
        }).from(matches).where(eq(matches.userId, userId))

        return NextResponse.json({ matches: matchesRecords }, {status: 200});
    } catch (error) {
        console.error('Error fetching teams:', error);
        return NextResponse.json({error: 'Failed to fetch teams'}, {status: 500});
    }

}
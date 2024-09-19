import { db } from "~/server/db";
import { NextResponse } from "next/server";
import { matches, teams, logs } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function DELETE(request: Request) {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
        return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    try {
        const existingMatches = await db.select().from(matches).where(eq(matches.userId, userId));
        const existingTeams = await db.select().from(teams).where(eq(teams.userId, userId));

        if (existingMatches.length === 0 && existingTeams.length === 0) {
            return NextResponse.json({ message: "No teams or matches to delete" }, { status: 200 });
        }
        
        // Delete all matches for the user
        await db.delete(matches).where(eq(matches.userId, userId));

        // Delete all teams for the user
        await db.delete(teams).where(eq(teams.userId, userId));

        const groupId = crypto.randomUUID()

        await db.insert(logs).values({
            userId: userId,
            operation: 'DELETE',
            groupId: groupId,
            dataType: 'NONE',
        })

        return NextResponse.json({ message: "ok" }, { status: 200 });
    } catch {
        return NextResponse.json({ message: 'Failed to delete data' }, { status: 500 });
    }
}
import { db } from "~/server/db";
import { NextResponse } from "next/server";
import { matches, teams } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function DELETE(request: Request) {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
        return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    try {
        // Delete all matches for the user
        await db.delete(matches).where(eq(matches.userId, userId));

        // Delete all teams for the user
        await db.delete(teams).where(eq(teams.userId, userId));

        return NextResponse.json({ message: "ok" }, { status: 200 });
    } catch (error) {
        console.error('Error deleting teams and matches:', error);
        return NextResponse.json({ error: "Failed to delete teams and matches" }, { status: 500 });
    }
}
import { db } from "~/server/db";
import { NextResponse } from "next/server";
import { teams } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";
import { Team } from "~/app/_types/types";

interface UserTeamData {
    name: string, 
    registrationDate: string, 
    groupNumber: string,
}

interface TeamPostRequest {
    userIdInput: string,
    userData: UserTeamData[]
}

interface TeamPutRequest {
    editInput: string,
    teamToBeEditted: Team,
    userId: string,
}

export const dynamic = "force-dynamic";
export async function POST(request: Request) {
    const {userIdInput, userData} = (await request.json() as TeamPostRequest);
    if (!userIdInput || !Array.isArray(userData)) {
        return NextResponse.json({ error: request.body}, { status: 400 });
    }

    for (const item of userData) {
        const teamName = item.name;
        const regDate = item.registrationDate;
        const groupNumber = item.groupNumber;
        await db.insert(teams).values({
            userId: userIdInput,
            name: teamName,
            group: groupNumber,
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
        return NextResponse.json({ message: 'Failed to fetch teams' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const {editInput, teamToBeEditted, userId} = await request.json() as TeamPutRequest;
    const [name, registrationDate, groupNumber] = editInput.split(' ');

    try {
        await db.update(teams).set({
            regDate: registrationDate
        }).where(and(eq(teams.name, teamToBeEditted.teamName), eq(teams.userId, userId)))
        return NextResponse.json({ status: 204 });
    } catch (error) {
        return NextResponse.json({ message: 'Failed to update team data' }, { status: 500 });
    }
}
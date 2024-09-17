import { and, eq, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { matches, teams } from "~/server/db/schema";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const teamName = searchParams.get('teamName');

    if (!userId || !teamName) {
        return NextResponse.json({ message: 'userId and teamName are required' }, { status: 400 });
    }

    try {
        const teamData = await db.select({
            regDate: teams.regDate,
            groupNumber: teams.group,
            wins: teams.wins,
            losts: teams.losts,
            draws: teams.draws,
            totalGoals: teams.totalScore,
        }).from(teams).where(and(eq(teams.userId, userId), eq(teams.name, teamName))).limit(1)

        const teamRecord = {...teamData[0]}

        if (!teamData) {
            return NextResponse.json({message: 'Team not found'}, {status: 404})
        }

        const matchData = await db.select({
            team1: matches.team1name,
            team2: matches.team2name,
            score1: matches.team1goals,
            score2: matches.team2goals,
        }).from(matches).where(or(eq(matches.team1name, teamName),eq(matches.team2name, teamName)));

        return NextResponse.json({teamDetails: teamRecord, matchDetails: matchData}, {status: 200})
    } catch (error) {
        console.error('Error fetching team data:', error);
        return NextResponse.json({ message: 'Failed to fetch team data' }, { status: 500 });
    }
}
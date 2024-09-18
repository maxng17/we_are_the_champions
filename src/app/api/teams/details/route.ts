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
        // After fetching the data, count the points and alternate points.
        const teamData = await db.select({
            regDate: teams.regDate,
            groupNumber: teams.group,
        }).from(teams).where(and(eq(teams.userId, userId), eq(teams.name, teamName))).limit(1)

        if (!teamData) {
            return NextResponse.json({message: 'Team not found'}, {status: 404})
        }

        let wins = 0
        let losts = 0
        let draws = 0
        let totalGoals = 0

        const matchData = await db.select({
            team1: matches.team1name,
            team2: matches.team2name,
            score1: matches.team1goals,
            score2: matches.team2goals,
        }).from(matches).where(or(eq(matches.team1name, teamName),eq(matches.team2name, teamName)));

        matchData.map(match => {
            const score1num = parseInt(match.score1)
            const score2num = parseInt(match.score2)

            const isTeam1 = match.team1 === teamName;
            const teamGoal = isTeam1 ? score1num : score2num
            const oppoGoal = isTeam1 ? score2num : score1num

            totalGoals += teamGoal
            if (teamGoal > oppoGoal) {
                wins += 1;
            } else if (teamGoal < oppoGoal) {
                losts += 1;
            } else {
                draws += 1;
            }
        })
        const teamRecord = {...teamData[0], wins: wins, losts: losts, draws:draws, totalGoals:totalGoals}

        return NextResponse.json({teamDetails: teamRecord, matchDetails: matchData}, {status: 200})
    } catch (error) {
        const e = error as Error
        return NextResponse.json({ message: e.message }, { status: 500 });
    }
}
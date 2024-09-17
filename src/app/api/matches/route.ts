import { db } from "~/server/db";
import { NextResponse } from "next/server";
import { matches, teams } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";

interface UserMatchData {
    team1: string,
    team2: string,
    score1: string,
    score2: string,
}

interface MatchPostRequest {
    userIdInput: string,
    userData: UserMatchData[],
}

export const dynamic = "force-dynamic";
export async function POST(request: Request) {
    const {userIdInput, userData} = (await request.json() as MatchPostRequest);
    if (!userIdInput || !Array.isArray(userData)) {
        return NextResponse.json({ error: request.body}, { status: 400 });
    }

    //Additional checks here
    for (const item of userData) {
        const team1name = item.team1;
        const team2name = item.team2;
        const team1goals = item.score1;
        const team2goals = item.score2;

        const team1Data = await db.select({
            totalScore: teams.totalScore,
            wins: teams.wins,
            losts: teams.losts,
            draws: teams.draws,
        }).from(teams).where(and(eq(teams.name, team1name), eq(teams.userId, userIdInput)));

        const team2Data = await db.select({
            totalScore: teams.totalScore,
            wins: teams.wins,
            losts: teams.losts,
            draws: teams.draws,
        }).from(teams).where(and(eq(teams.name, team2name), eq(teams.userId, userIdInput)));

        if (!team1Data || !team2Data) {
            return NextResponse.json({error: "One or both of the teams are invalid."}, {status: 400})
        }

        const updatedTeam1 = { ...team1Data[0] };
        const updatedTeam2 = { ...team2Data[0] }; 

        const team1goalsNum = parseInt(team1goals)
        const team1CurScore = parseInt(team1Data[0]?.totalScore?? '0')
        updatedTeam1.totalScore = (team1CurScore + team1goalsNum).toString()

        const team2goalsNum = parseInt(team2goals)
        const team2CurScore = parseInt(team2Data[0]?.totalScore?? '0')
        updatedTeam2.totalScore = (team2CurScore + team2goalsNum).toString()

        if (team1goalsNum > team2goalsNum) {
            const curT1wins = parseInt(team1Data[0]?.wins?? '0')
            updatedTeam1.wins = (curT1wins + 1).toString()

            const curT2loses = parseInt(team2Data[0]?.losts?? '0')
            updatedTeam2.losts = (curT2loses + 1).toString()
        } else if (team1goalsNum < team2goalsNum) {
            const curT2wins = parseInt(team2Data[0]?.wins?? '0')
            updatedTeam2.wins = (curT2wins + 1).toString()

            const curT1loses = parseInt(team1Data[0]?.losts?? '0')
            updatedTeam1.losts = (curT1loses + 1).toString()
        } else {
            const curT2draws = parseInt(team2Data[0]?.wins?? '0')
            updatedTeam2.draws = (curT2draws + 1).toString()

            const curT1draws = parseInt(team1Data[0]?.losts?? '0')
            updatedTeam1.draws = (curT1draws + 1).toString()
        }

        await db.update(teams).set({
            wins: updatedTeam1.wins,
            losts: updatedTeam1.losts,
            draws: updatedTeam1.draws,
            totalScore: updatedTeam1.totalScore,
        }).where(and(eq(teams.name, team1name), eq(teams.userId, userIdInput)))

        await db.update(teams).set({
            wins: updatedTeam2.wins,
            losts: updatedTeam2.losts,
            draws: updatedTeam2.draws,
            totalScore: updatedTeam2.totalScore,
        }).where(and(eq(teams.name, team2name), eq(teams.userId, userIdInput)))
         
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
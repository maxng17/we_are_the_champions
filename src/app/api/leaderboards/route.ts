import { db } from "~/server/db";
import { NextResponse } from "next/server";
import { matches, teams } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
        return NextResponse.json({message: 'User ID is required'}, {status: 400})
    }

    try {
        const teamRecords= await db.select({
            teamName: teams.name,
            registrationDate: teams.regDate,
            groupNumber: teams.group,
        }).from(teams).where(eq(teams.userId, userId));

        const matchRecords = await db.select({
            team1name: matches.team1name,
            team2name: matches.team2name,
            team1goals: matches.team1goals,
            team2goals: matches.team2goals
        }).from(matches).where(eq(matches.userId, userId))

        const leaderboardData = teamRecords.map(team => {
            const { teamName, registrationDate, groupNumber } = team;

            const teamMatches = matchRecords.filter(
                (match) => match.team1name === teamName || match.team2name === teamName
            );

            let winsNum = 0
            let lostsNum = 0
            let drawsNum = 0
            let totalScoreNum = 0

            for (const match of teamMatches) {
                const score1num = parseInt(match.team1goals)
                const score2num = parseInt(match.team2goals)

                const isTeam1 = match.team1name === teamName;
                const teamGoal = isTeam1 ? score1num : score2num
                const oppoGoal = isTeam1 ? score2num : score1num

                totalScoreNum += teamGoal
                if (teamGoal > oppoGoal) {
                    winsNum += 1;
                } else if (teamGoal < oppoGoal) {
                    lostsNum += 1;
                } else {
                    drawsNum += 1;
                }
            }

                const totalPoints = (winsNum * 3) + (drawsNum * 1);
                const alternatePoints = (winsNum * 5) + (drawsNum * 3) + (lostsNum * 1);

                const dateArr = registrationDate?? '0'.split('/')
                const day = parseInt(dateArr[0]?? '0')
                const month = parseInt(dateArr[1]?? '0')
                const regDate = new Date(2024, month-1, day);

                return {
                    regDate,
                    totalPoints,
                    alternatePoints,
                    winsNum,
                    lostsNum,
                    drawsNum,
                    totalScoreNum,
                    groupNumber,
                    teamName,
                }
        })

        const sortedTeams = leaderboardData.sort((a,b) => {
            if (a.totalPoints !== b.totalPoints) return b.totalPoints - a.totalPoints;
            if (a.totalScoreNum !== b.totalScoreNum) return b.totalScoreNum - a.totalScoreNum;
            if (a.alternatePoints !== b.alternatePoints) return b.alternatePoints - a.alternatePoints; 
            if (a.regDate.getMonth() !== b.regDate.getMonth()) return a.regDate.getMonth() - b.regDate.getMonth();
            return a.regDate.getDay() - b.regDate.getDay();
        })
        const group1 = sortedTeams.filter(record => record.groupNumber === '1');
        const group2 = sortedTeams.filter(record => record.groupNumber === '2');

        return NextResponse.json({group1: group1, group2: group2}, {status:200})
    } catch (error) {
        console.error('Error fetching teams:', error);
        return NextResponse.json({message: 'Failed to fetch data'}, {status: 500});
    }
}

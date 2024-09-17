import { db } from "~/server/db";
import { NextResponse } from "next/server";
import { teams } from "~/server/db/schema";
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
            wins: teams.wins,
            losts: teams.losts,
            draws: teams.draws,
            totalScore: teams.totalScore,
        }).from(teams).where(eq(teams.userId, userId));

        const addedFields = teamRecords.map(team => {
            const winsNum = parseInt(team.wins?? '0')
            const lostsNum = parseInt(team.losts?? '0')
            const drawsNum = parseInt(team.draws?? '0')
            const totalScoreNum = parseInt(team.totalScore?? '0')
            const totalPoints = (winsNum * 3) + (drawsNum * 1);
            const alternatePoints = (winsNum * 5) + (drawsNum * 3) + (lostsNum * 1);
            const teamGroup = team.groupNumber
            const teamName = team.teamName

            const dateArr = team.registrationDate?? '0'.split('/')
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
                teamGroup,
                teamName,
            }
        })
        const sortedTeams = addedFields.sort((a,b) => {
            if (a.totalPoints !== b.totalPoints) return b.totalPoints - a.totalPoints;
            if (a.totalScoreNum !== b.totalScoreNum) return b.totalScoreNum - a.totalScoreNum;
            if (a.alternatePoints !== b.alternatePoints) return b.alternatePoints - a.alternatePoints; 
            if (a.regDate.getMonth() !== b.regDate.getMonth()) return a.regDate.getMonth() - b.regDate.getMonth();
            return a.regDate.getDay() - b.regDate.getDay();
        })
        const group1 = sortedTeams.filter(record => record.teamGroup === '1');
        const group2 = sortedTeams.filter(record => record.teamGroup === '2');

        return NextResponse.json({group1: group1, group2: group2}, {status:200})
    } catch (error) {
        console.error('Error fetching teams:', error);
        return NextResponse.json({error: 'Failed to fetch data'}, {status: 500});
    }
}

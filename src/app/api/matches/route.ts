import { db } from "~/server/db";
import { NextResponse } from "next/server";
import { logs, matches, teams } from "~/server/db/schema";
import { and, eq, or} from "drizzle-orm";
import { type MatchInput } from "~/app/_types/types";

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

interface MatchPutRequest {
    trimmedInput: string,
    matchToBeEditted: MatchInput,
    userId: string,
}

export const dynamic = "force-dynamic";
export async function POST(request: Request) {
    const {userIdInput, userData} = (await request.json() as MatchPostRequest);
    if (!userIdInput || !Array.isArray(userData)) {
        return NextResponse.json({ message: request.body}, { status: 400 });
    }

    const teamDatas = await db.select().from(teams).where(eq(teams.userId, userIdInput));
    const checkTeamNames = new Set(teamDatas.map(teamData => teamData.name));
    const checkSameGroup = new Map(teamDatas.map(teamData => [teamData.name, teamData.group] ))

    const matchDatas = await db.select().from(matches).where(eq(matches.userId, userIdInput));
    const checkExistingMatchesName = new Set(matchDatas.map(matchData => `${matchData.team1name}_${matchData.team2name}`))

    let lineNum = 1;

    //Checks here before adding all new inputs
    for (const item of userData) {
        const team1name = item.team1;
        const team2name = item.team2;
         
        // Check legit team name for team1
        if (!checkTeamNames.has(team1name)) {
            return NextResponse.json({message: `Error on line ${lineNum}: Team '${team1name}' does not exist.`}, {status: 400})
        }

        // Check legit team name for team2
        if (!checkTeamNames.has(team2name)) {
            return NextResponse.json({message: `Error on line ${lineNum}: Team '${team2name}' does not exist.`}, {status: 400})
        }

        const comName1 = team1name + "_" + team2name
        const comName2 = team2name + "_" + team1name

        // Check to make sure they never played against each other yet
        if (checkExistingMatchesName.has(comName1) || checkExistingMatchesName.has(comName2)) {
            return NextResponse.json(
                {message: `Error on line ${lineNum}: Teams '${team1name}' and '${team2name}' have already played against each other. Check current inputs or previously added match results.`}
                    , {status : 400})
        }

        // Check to make sure they are in the same group
        if (checkSameGroup.get(team1name) !== checkSameGroup.get(team2name)) {
            return NextResponse.json(
                {message: `Error on line ${lineNum}:  Teams '${team1name}' and '${team2name}' are not in the same group.`}
                    , {status : 400})
        }

        lineNum += 1;
    }

    const groupId = crypto.randomUUID();

    for (const item of userData) {
        const team1name = item.team1;
        const team2name = item.team2;
        const team1goals = item.score1;
        const team2goals = item.score2;

        const reConstructInput = team1name + ' ' + team2name + ' ' + team1goals + ' ' + team2goals
         
        await db.insert(matches).values({
            userId: userIdInput,
            team1goals:team1goals,
            team1name:team1name,
            team2goals:team2goals,
            team2name:team2name,
        })

        await db.insert(logs).values({
            userId : userIdInput,
            operation : "ADD",
            dataType : "MATCHES",
            inputData :reConstructInput,
            groupId : groupId,
        })
    }


    return NextResponse.json({message: 'ok'}, {status: 200})
}

export async function GET(request: Request) {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
        return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    try {
        const matchesRecords = await db.select({
            team1: matches.team1name,
            team2: matches.team2name,
            score1: matches.team1goals,
            score2: matches.team2goals,
        }).from(matches).where(eq(matches.userId, userId))

        return NextResponse.json({ matches: matchesRecords }, {status: 200});
    } catch (error) {
        console.error('Error fetching teams:', error);
        return NextResponse.json({message: 'Failed to fetch teams'}, {status: 500});
    }

}

export async function PUT(request: Request) {
    try {
        const {trimmedInput, matchToBeEditted, userId} = await request.json() as MatchPutRequest;
        const [nTeam1name, nTeam2name, nTeam1goals, nTeam2goals] = trimmedInput.split(/\s+/);

        if (nTeam1name === undefined || nTeam1goals === undefined || nTeam2name === undefined || nTeam2goals === undefined) {
            return NextResponse.json({ message: "Missing fields detected." }, { status: 400 });
        }

        const originalMatch = await db.select().from(matches)
            .where(and(eq(matches.userId, userId), eq(matches.team1name, matchToBeEditted.team1), eq(matches.team2name, matchToBeEditted.team2)))

        // Should not a case that happens, refresh page to get latest data
        if (!originalMatch[0]) {
            return NextResponse.json({ message: 'Match result not found. Please refresh the page.' }, { status: 404 })
        }

        const { team1name: ogTeam1Name, team2name: ogTeam2Name, id: ogId, team1goals: ogTeam1goals, team2goals: ogTeam2goals } = originalMatch[0];

        const groupId = crypto.randomUUID();
        const newInputString = nTeam1name + ' ' + nTeam2name + ' ' + nTeam1goals + ' ' + nTeam2goals
        const ogInputString = ogTeam1Name + ' ' + ogTeam2Name + ' ' + ogTeam1goals + ' ' + ogTeam2goals

        // Score only update
        if ((ogTeam1Name === nTeam1name && ogTeam2Name === nTeam2name) || (ogTeam1Name === nTeam2name && ogTeam2Name === nTeam1name))  {
            await db.update(matches).set({
                team1goals: nTeam1goals,
                team2goals: nTeam2goals,
            }).where(eq(matches.id, ogId))

            await db.insert(logs).values({
                userId : userId,
                operation : "EDIT",
                dataType : 'MATCHES',
                inputData :newInputString,
                prevData :ogInputString,
                groupId : groupId,
            })

            return NextResponse.json({ status: 204 });
        } else {
            // Team 1 name is invalid
            const checkTeam1 = await db.select().from(teams).where(and(eq(teams.userId, userId), eq(teams.name, nTeam1name))).limit(1)
            if (checkTeam1.length === 0) {
                return NextResponse.json({ message: `Team '${nTeam1name}' does not exist` }, { status: 400 });
            }

            // Team 2 name is invalid
            const checkTeam2 = await db.select().from(teams).where(and(eq(teams.userId, userId), eq(teams.name, nTeam2name))).limit(1);
            if (checkTeam2.length === 0) {
                return NextResponse.json({ message: `Team '${nTeam2name}' does not exist` }, { status: 400 });
            }

            const team1group = checkTeam1[0]?.group
            const team2group = checkTeam2[0]?.group

            // Both teams are not in same group so cannot compete
            if (team1group !== team2group) {
                return NextResponse.json({ message: `Teams '${nTeam1name}' and '${nTeam2name}' are not in the same group` }, { status: 400 }); 
            }

            // Check not repeated data
            const checkPlayedBefore = await db.select().from(matches)
                .where(
                    or(
                        and(eq(matches.userId, userId), eq(matches.team1name, nTeam1name), eq(matches.team2name, nTeam2name)),
                        and(eq(matches.userId, userId), eq(matches.team1name, nTeam2name), eq(matches.team2name, nTeam1name))
                    )
                ).limit(1)
            if (checkPlayedBefore.length === 1) {
                return NextResponse.json({ message: `Teams '${nTeam1name}' and '${nTeam2name}' have already played against each other` }, { status: 400 });
            }

            await db.update(matches)
            .set({
                team1name: nTeam1name,
                team2name: nTeam2name,
                team1goals: nTeam1goals,
                team2goals: nTeam2goals,
            })
            .where(eq(matches.id, ogId));

            await db.insert(logs).values({
                userId : userId,
                operation : "EDIT",
                dataType : 'MATCHES',
                inputData :newInputString,
                prevData :ogInputString,
                groupId : groupId,
            })

            return NextResponse.json({ status: 204 });
        }
    } catch (error) {
        console.error("Error updating match:", error);
        return NextResponse.json({ message: "Failed to update match" }, { status: 500 });
    }
}
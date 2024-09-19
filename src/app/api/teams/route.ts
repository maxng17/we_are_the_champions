import { db } from "~/server/db";
import { NextResponse } from "next/server";
import { matches, teams, logs } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";
import  { type Team } from "~/app/_types/types";

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
    trimmedInput: string,
    teamToBeEditted: Team,
    userId: string,
}

export const dynamic = "force-dynamic";
export async function POST(request: Request) {
    try {
        const {userIdInput, userData} = (await request.json() as TeamPostRequest);
        if (!userIdInput || !Array.isArray(userData)) {
            return NextResponse.json({ error: request.body}, { status: 400 });
        }

        const groupId = crypto.randomUUID();

        for (const item of userData) {
            const teamName = item.name;
            const regDate = item.registrationDate;
            const groupNumber = item.groupNumber;

            const reConstructInput = teamName + ' ' + regDate + ' ' + groupNumber

            await db.insert(teams).values({
                userId: userIdInput,
                name: teamName,
                group: groupNumber,
                regDate: regDate,
            })

            await db.insert(logs).values({
                userId : userIdInput,
                operation : 'ADD',
                dataType : 'TEAMS',
                inputData : reConstructInput,
                groupId: groupId
            });
        
        }

        return NextResponse.json({ message: 'ok' }, { status: 200 }); 
    } catch (error) {
        const e = error as Error;
        return NextResponse.json({ message: e.message }, { status: 500 });
    }
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
        const e = error as Error;
        return NextResponse.json({ message: e.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const {trimmedInput, teamToBeEditted, userId} = await request.json() as TeamPutRequest;
        const [name, registrationDate, groupNumber] = trimmedInput.split(/\s+/);

        if (name === undefined || registrationDate === undefined || groupNumber === undefined) {
            return NextResponse.json({message: 'Missing fields detected'}, {status: 400})
        }
        
        const originalTeam = await db.select().from(teams).where(and(eq(teams.userId, userId), eq(teams.name, teamToBeEditted.teamName)))
        if (!originalTeam[0]) {
            return NextResponse.json({message: 'Team result not found. Please refresh your page.'}, {status: 404})
        }

        const {name: ogName, group: ogGroup, id: ogId, regDate: ogDate} = originalTeam[0]

        // Repeated check for unique name. Done in frontend already but just in case
        if (name != ogName) {
            const checkUniqueName = await db
                .select()
                .from(teams)
                .where(and(eq(teams.userId, userId), eq(teams.name, name)))

            if (checkUniqueName.length > 0) {
                return NextResponse.json({message: `Team name is already being taken`}, {status: 400})
            }
        }

        // check when group number change if the other group has space
        if (groupNumber !== ogGroup) {
            const checkGroupCount = await db
                .select()
                .from(teams)
                .where(and(eq(teams.userId, userId), eq(teams.group, groupNumber)));

            if (checkGroupCount.length >= 6) {
                return NextResponse.json({ message: `Group ${groupNumber} already has 6 teams.` }, { status: 400 });
            }
        }

        await db.update(teams).set({
            name: name,
            regDate: registrationDate,
            group: groupNumber,
        }).where(eq(teams.id, ogId))

        // If there is name change, propagate changes to 
        if (name !== ogName) {
            await db.update(matches).set({
                team1name : name
            }).where(and(eq(matches.userId, userId), eq(matches.team1name, ogName)))

            await db.update(matches).set({
                team2name : name
            }).where(and(eq(matches.userId, userId), eq(matches.team2name, ogName)))
        }

        const groupId = crypto.randomUUID();
        const ogInputString = ogName + " " + ogDate + " " + ogGroup;
        const newInputString = name + " " + registrationDate + " " + groupNumber;

        await db.insert(logs).values({
            userId : userId,
            operation : "EDIT",
            dataType : 'TEAMS',
            inputData :newInputString,
            prevData :ogInputString,
            groupId : groupId,
        })

        return NextResponse.json({ status: 204 }); 
    } catch (error) {
        const e = error as Error;
        return NextResponse.json({ message: e.message }, { status: 500 });
    }
}
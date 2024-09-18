export interface Team {
    teamName: string;
    registrationDate: string;
    groupNumber: string;
}

export interface MatchInput {
    team1: string;
    team2: string;
    score1: string;
    score2: string;
}

export interface LeaderBoardsData {
    regDate: Date;
    totalPoints: number;
    alternatePoints: number;
    winsNum: number;
    lostsNum: number;
    drawsNum: number;
    totalScoreNum: number;
    groupNumber: string;
    teamName: string;
}

export interface TeamDetailsData {
    regDate: string;
    groupNumber: string;
    wins: string;
    losts: string;
    draws: string;
    totalGoals: string;
}

export interface DataLog {
    operation: string;
    dataType: string;
    createdAt: Date;
    groupId: string;
}

export interface LogDetails {
    prevData: string | null;
    inputData: string | null;
    operation: string;
    dataType: string;
}

export interface ErrorResponse {
    message: string
}
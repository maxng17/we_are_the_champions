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

export interface ErrorResponse {
    message: string
}
'use client'

import { useAuth } from "@clerk/nextjs"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { MatchInput, TeamDetailsData } from "../../_types/types"
import MatchesTable from "../../_components/matchesTable"

interface TeamNameGetResponse {
    teamDetails: TeamDetailsData | null;
    matchDetails: MatchInput[];
}

export default function TeamDetailPage() {
    const [teamData, setTeamData] = useState<TeamDetailsData | null>(null);
    const [matchData, setMatchData] = useState<MatchInput[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const { userId } = useAuth();
    const { teamName } = useParams<{ teamName: string }>();

    useEffect(() => {
        if (userId && teamName) {
            const fetchTeam = async () => {
                if (!teamName || !userId) {
                    setError('Invalid parameters.');
                    setLoading(false);
                    return;
                }
    
                try {
                    const response = await fetch(`/api/teams/details?userId=${userId}&teamName=${teamName}`);
                    
                    if (!response.ok) {
                        throw new Error('Failed to fetch team');
                    }
    
                    const data = await response.json() as TeamNameGetResponse;
                    if (data.teamDetails && Object.keys(data.teamDetails).length > 0) {
                        setTeamData(data.teamDetails);
                        setMatchData(data.matchDetails);
                        setError('');
                    } else {
                        setTeamData(null);
                        setError('No such team.');
                    }
                    setLoading(false);
                } catch (error) {
                    console.error('Error fetching team data:', error);
                    setError('Failed to load team data.');
                    setLoading(false);
                }
            };
            const fetchData = async () => {
                await fetchTeam();
            };
            fetchData().catch(error => console.error('Error in fetching data:', error));
        }
    }, [teamName, userId]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    if (!teamData) return <div>No such team.</div>;

    return (
        <div className="min-h-screen p-4">
            <div className="bg-white p-6 rounded-lg shadow-md mb-4">
                <h1 className="text-2xl font-bold mb-2">Team Details:</h1>
                <div className="mb-4">
                    <p><strong>Registration Date:</strong> {teamData.regDate}</p>
                    <p><strong>Group Number:</strong> {teamData.groupNumber}</p>
                    <p><strong>Wins:</strong> {teamData.wins}</p>
                    <p><strong>Losses:</strong> {teamData.losts}</p>
                    <p><strong>Draws:</strong> {teamData.draws}</p>
                    <p><strong>Total Goals:</strong> {teamData.totalGoals}</p>
                    <p><strong>Matches Played:</strong> {matchData.length}</p>
                </div>
                <MatchesTable matches={matchData} />
            </div>
        </div>
    );
}
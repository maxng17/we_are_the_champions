'use client'

import { useEffect, useState } from "react";
import LeaderBoardTable from "../_components/leaderboardTable";
import { LeaderBoardsData } from "../_types/types";
import { useAuth } from "@clerk/nextjs";

interface LeaderboardsGetResponse {
    group1: LeaderBoardsData[];
    group2: LeaderBoardsData[];
}


export default function LeaderboardPage() {
    const [group1Data, setGroup1Data] = useState<LeaderBoardsData[]>([]);
    const [group2Data, setGroup2Data] = useState<LeaderBoardsData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const {userId} = useAuth(); 

    useEffect(() => {
        if (userId) {
            const fetchLeaderboardData = async () => {
                try {
                    const response = await fetch(`/api/leaderboards?userId=${userId}`);
                    if (!response.ok) {
                        console.log(response)
                        throw new Error('Failed to fetch leaderboard data');
                    }
                    const data = await response.json() as LeaderboardsGetResponse;
                    setGroup1Data(data.group1);
                    setGroup2Data(data.group2);
                    setLoading(false);
                } catch (error) {
                    console.error('Error fetching leaderboard data:', error);
                    setError('Failed to load leaderboard data.');
                    setLoading(false);
                }
            };

            const fetchData = async () => {
                await fetchLeaderboardData();
            };
    
            fetchData().catch(error => console.error('Error in fetching data:', error));
        }
    }, [userId]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className='min-h-screen flex flex-col p-4'>
            <div className="flex flex-col space-y-8 p-4">
                <div className="flex justify-center">
                    <LeaderBoardTable teamData={group1Data} groupName="1" />
                </div>
                <div className="flex justify-center">
                    <LeaderBoardTable teamData={group2Data} groupName="2" />
                </div>
            </div>
        </div>
    );
}

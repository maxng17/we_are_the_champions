'use client'

import { useEffect, useState } from "react";
import LeaderBoardTable from "../_components/leaderboardTable";
import { type LeaderBoardsData } from "../_types/types";
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
                        throw new Error('Failed to fetch leaderboard data');
                    }
                    const data = await response.json() as LeaderboardsGetResponse;
                    setGroup1Data(data.group1);
                    setGroup2Data(data.group2);
                } catch {
                    // Error here is unexpected, refresh page to retry
                    setError('Failed to load leaderboard data. Please refresh the page. If problem persist please delete all data and try again.');
                } finally {
                    setLoading(false);
                }
            };

            const fetchData = async () => {
                await fetchLeaderboardData();
            };
    
            fetchData().catch(() => {
                setError("Something went wrong. Please refresh the page. If problem persist please delete all data and try again."); 
            });
        }
    }, [userId]);

    if (error) return <div>Error: {error}</div>;

    return (
        <>
            {loading ? (
                <div className="flex justify-center items-center min-h-screen">
                    <p>Loading...</p>
                </div>
            ) : (
                <>
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
                </>
            )}
        </>
    );
}

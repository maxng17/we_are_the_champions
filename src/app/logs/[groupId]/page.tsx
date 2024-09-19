'use client'

import { useAuth } from "@clerk/nextjs"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { LogDetails } from "~/app/_types/types";

interface LogDetailGetResponse {
    logsDetails: LogDetails[]
}

export default function LogDetailPage() {
    const [logDetails, setLogDetails] = useState<LogDetails[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const { userId } = useAuth();
    const { groupId } = useParams<{ groupId: string }>();

    const isEdit =logDetails[0]?.operation

    useEffect(() => {
        if (userId && groupId) {
            const fetchTeam = async () => {
                if (!groupId || !userId) {
                    setError('Invalid parameters.');
                    setLoading(false);
                    return;
                }
    
                try {
                    const response = await fetch(`/api/logs/details?userId=${userId}&groupId=${groupId}`);
                    
                    if (!response.ok) {
                        setError('No such logs exist.');
                    } else {
                        const data = await response.json() as LogDetailGetResponse;
                        setLogDetails(data.logsDetails)
                    }
                } catch (error) {
                    setError('Failed to load logs data. Please refresh the page.');
                } finally {
                    setLoading(false)
                }
            };
            const fetchData = async () => {
                await fetchTeam();
            };
            fetchData().catch(error => {
                setError("Something went wrong. Please refresh the page. If problem persist please delete all data and try again."); 
            });
        }
    }, [groupId, userId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p>Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    const num = logDetails.length

    return (
        <div className="p-4 flex flex-col items-center h-screen w-full ">
            {isEdit === 'EDIT' && (
                <div className="border p-4 bg-gray-100 w-[80%]" style={{ marginTop: '10vh' }}>
                    <h3 className="text-lg font-semibold">Operation: Edit</h3>
                    <p><strong>Data Type:</strong> {logDetails[0]?.dataType === 'TEAMS'? 'Teams': 'Match Results'}</p>
                    <p><strong>From:</strong> {logDetails[0]?.prevData }</p>
                    <p><strong>Changed To:</strong> {logDetails[0]?.inputData}</p>
                </div>
            )}

            {isEdit === 'ADD' && (
                <div className="border p-4 bg-gray-100 w-[80%]" style={{ marginTop: '10vh' }}>
                    <h3 className="text-lg font-semibold">Operation: Add</h3>
                    <p><strong>Data Type:</strong> {logDetails[0]?.dataType === 'TEAMS'? 'Teams': 'Match Results'}</p>
                    <h4 className="font-semibold">Inputs:</h4>
                    <textarea
                        readOnly
                        value={logDetails.map(log => log.inputData).join('\n') || 'No input data'}
                        className="w-full h-32 border border-gray-300 p-2"
                        rows={num}
                    />
                </div>
            )}
        </div>
    );
}
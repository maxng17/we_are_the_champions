'use client'

import { useEffect, useState } from "react";
import { type DataLog } from "../_types/types";
import { useAuth } from "@clerk/nextjs";
import LogsTable from "../_components/logsTable";


interface DataLogGetResponse {
    sortedResults: DataLog[]
}

export default function LogPage() {

    const [dataLogs, setDataLogs] = useState<DataLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const {userId} = useAuth()

    useEffect(() => {
        if (userId) {
            const fetchLogsdData = async () => {
                try {
                    const response = await fetch(`/api/logs?userId=${userId}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch logs data');
                    }
                    const data = await response.json() as DataLogGetResponse;
                    setDataLogs(data.sortedResults)
                } catch (error) {
                    setError('Failed to load logs data. Please refresh the page.');
                } finally {
                    setLoading(false)
                }
            };

            const fetchData = async () => {
                await fetchLogsdData();
            };

            fetchData().catch(() => {
                setError("Something went wrong. Please refresh the page."); 
            })
    
        }
    }, [userId]);

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

    return (
        <div className="flex flex-col items-center h-screen w-full">
            <div className="w-[80%] p-4" style={{ marginTop: '5vh' }}>
                <LogsTable logDatas={dataLogs} />
            </div>
        </div>
    );
}
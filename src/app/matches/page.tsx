'use client'

import { useEffect, useState } from "react";
import MatchesTable from "../_components/matchesTable";
import { useAuth } from "@clerk/nextjs";
import {MatchInput, ErrorResponse}  from "../_types/types";

interface MatchesGetResponse {
    matches: MatchInput[];
}

export default function MatchesPage() { 
    const [matches, setMatches] = useState<MatchInput[]>([]);
    const [showMatchesModal, setShowMatchesModal] = useState(false);
    const [matchesInput, setMatchesInput] = useState('');
    const [matchError, setMatchError] = useState('');

    const {userId} = useAuth();
    const isAddMatchesDisabled = matches.length >= 30;

    useEffect(() => {
        if (userId) {    
            const fetchMatches = async () => {
                try {
                    const response = await fetch(`/api/matches?userId=${userId}`);
                    if (!response.ok) {
                        throw new Error('Network response not ok');
                    }
                    const data = await response.json() as MatchesGetResponse;
                    setMatches(data.matches);
                } catch (error) {
                    console.error('Error fetching matches:', error);
                }
            };
    
            const fetchData = async () => {
                await fetchMatches();
            };
    
            fetchData().catch(error => console.error('Error in fetching data:', error));
        }
    }, [userId]);

    const handleMatchSubmit = async () => {
        if (!matchesInput.trim()) {
            setMatchError('No data entered!')
            return 
        }
        const userInput = matchesInput.split('\n').filter(line => line.trim() != '')
        if (matchesInput.length === 0) {
            setMatchError('No data entered!')
            return
        }

        for (let x = 0; x < userInput.length; x++) {
            const line = userInput[x]?.trim()
            if (!line) {
                continue
            }
            const fields = line.split(' ');
            console.log(fields)
            if (fields.length !== 4) {
                setMatchError(`Error on line ${x + 1}: Each line must contain exactly 4 fields (Team 1, Team 2, Team 1 goals, Team 2 goals).`);
                return
            }
            const [team1, team2, score1, score2] = fields;

            if (!team1 || !team2 || !score1 || !score2) {
                setMatchError(`Error on line ${x + 1}: All fields are required (Team 1, Team 2, Team 1 goals, Team 2 goals)`);
                return;
            }
        }

        setMatchError('');
        const userData = userInput.map(line => {
            const [team1, team2, score1, score2] = line.trim().split(' ');
            return {team1, team2, score1, score2};
        });
        const userIdInput = userId

        try {
            const response = await fetch('/api/matches', {
                method: 'POST',
                headers: {'Content-Type': 'application/json' },
                body: JSON.stringify({userIdInput, userData})
            });
            
            if (response.ok) {
                const updatedResponse = await fetch(`/api/matches?userId=${userId}`);
                const updatedData = await updatedResponse.json() as MatchesGetResponse;
                setMatches(updatedData.matches);
                setMatchesInput('');
                setShowMatchesModal(false);
            } else {
                const error = await response.json() as ErrorResponse;
                setMatchError(`Error: ${error.message}`);
            }

        } catch (error) {
            const e = error as Error;
            setMatchError('Error occured while submitting the data. Please try again!')
            console.log(e.message)
        }
    }

    const handleDeleteAllData = async() => {
        if (!window.confirm("Are you sure you want to delete all team and match data? This action cannot be undone.")) {
            return
        } try {
            const response = await fetch(`/api/deleteAll?userId=${userId}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                setMatches([]);
                alert('All team and match data has been deleted.');
            } else {
                const error = await response.json() as ErrorResponse;
                console.error('Error deleting data:', error.message);
                alert('Failed to delete data.');
            }
        } catch (error) {
            const e = error as Error;
            console.error('Error occurred during deletion:', e.message);
            alert('An error occurred while deleting the data.');
        }
    }

    return (
        <div className='min-h-screen flex flex-col p-4'>
            <div className="flex justify-end mb-4 space-x-4 p-4">
                <button onClick={() => setShowMatchesModal(true)} className="bg-blue-500 text-white px-4 py-2 rounded-lg mr-4">
                    Add Match Results
                </button>
                <button onClick={handleDeleteAllData} className="bg-red-500 text-white px-4 py-2 rounded-lg">
                    Delete All Data
                </button>
            </div>
            <div className="flex p-4 flex-grow justify-center space-x-8">
                <div className="flex justify-center w-[80%]">
                    <MatchesTable matches={matches} />
                </div>
            </div>

            {showMatchesModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
                    <div className="w-[700px] bg-white rounded flex flex-col p-6">
                        <h2>Add Match Details</h2>
                        <textarea 
                            value={matchesInput}
                            onChange={(e) => setMatchesInput(e.target.value)}
                            rows={12}
                            placeholder="Enter match data here..."
                            className="rounded-lg w-full p-4 mt-2 text-lg border-2 border-black"
                        />
                        {matchError && <p className="text-red-500 mt-2">{matchError}</p>}
                        <div className="flex justify-between mt-4 px-4">
                            <button onClick={handleMatchSubmit} className="px-4 py-2 text-white bg-green-500 border border-green-700 rounded-lg">Submit</button>
                            <button onClick={() => {
                                setMatchError('');
                                setMatchesInput('');
                                setShowMatchesModal(false);
                            }} className="px-4 py-2 text-white bg-red-500 border border-red-700 rounded-lg">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
'use client'

import { useEffect, useState } from "react";
import MatchPageTable from "../_components/matchesPageTable";
import { useAuth } from "@clerk/nextjs";
import {type MatchInput, type ErrorResponse}  from "../_types/types";

interface MatchesGetResponse {
    matches: MatchInput[];
}

export default function MatchesPage() { 
    const [matches, setMatches] = useState<MatchInput[]>([]);
    const [showMatchesModal, setShowMatchesModal] = useState(false);
    const [matchesInput, setMatchesInput] = useState('');
    const [matchError, setMatchError] = useState('');

    const [matchToBeEditted, setMatchToBeEditted] = useState<MatchInput | null>(null);
    const [editInput, setEditInput] = useState('');
    const [showEditModal, setShowEditModal] = useState(false)

    const [isPageLoading, setIsPageLoading] = useState(false);
    const [isAddModalLoading, setIsAddModalLoading] = useState(false);
    const [isEditModalLoading, setIsEditModalLoading] = useState(false);

    const {userId} = useAuth();
    const isAddMatchesDisabled = matches.length >= 30;

    useEffect(() => {
        if (userId) {    
            const fetchMatches = async () => {
                setIsPageLoading(true)
                try {
                    const response = await fetch(`/api/matches?userId=${userId}`);
                    if (!response.ok) {
                        throw new Error('Network response not ok');
                    }
                    const data = await response.json() as MatchesGetResponse;
                    setMatches(data.matches);
                } catch (error) {
                    console.error('Error fetching matches:', error);
                } finally {
                    setIsPageLoading(false)
                }
            };
    
            const fetchData = async () => {
                await fetchMatches();
            };
    
            fetchData().catch(error => console.error('Error in fetching data:', error));
        }
    }, [userId]);

    const handleMatchSubmit = async () => {
        // Check if data is entered
        if (!matchesInput.trim()) {
            setMatchError('No data entered!')
            return 
        }
        const userInput = matchesInput.split('\n').filter(line => line.trim() != '')

        const checkExistingMatches = new Set(matches.map(matchResult => `${matchResult.team1}_${matchResult.team2}`))

        for (let x = 0; x < userInput.length; x++) {
            const line = userInput[x]

            if (!line) {
                setMatchError(`Error on line ${x + 1}: Invalid input. Refresh the page and try again if error persist.`);
                return; 
            }

            const fields = line.trim().split(/\s+/);

            // Check for correct number of fields
            if (fields.length !== 4) {
                setMatchError(`Error on line ${x + 1}: Each line must contain exactly 4 fields (Team 1, Team 2, Team 1 goals, Team 2 goals).`);
                return
            }

            const [team1, team2, score1, score2] = fields;

            if (!team1 || !team2 || !score1 || !score2) {
                setMatchError(`Error on line ${x + 1}: All fields are required (Team 1, Team 2, Team 1 goals, Team 2 goals)`);
                return;
            }

            // Check to ensure both team names are not the same
            if (team1 === team2) {
                setMatchError(`Error on line ${x + 1}: Team 1 and Team 2 cannot be the same.`);
                return;
            }

            const score1num = parseInt(score1);
            const score2num = parseInt(score2);

            // Check that the scores are legit numbers
            if (isNaN(score1num) || isNaN(score2num)) {
                setMatchError(`Error on line ${x + 1}: Scores must be valid numbers.`);
                return;
            }

            // Check that the scores are not negative
            if (score1num < 0 || score2num < 0) {
                setMatchError(`Error on line ${x + 1}: Scores cannot be negative.`);
                return;
            }

            const comName1 = team1 + '_' + team2;
            const comName2 = team2 + '_' + team1;

            // Check that the teams have not played against each other yet
            if (checkExistingMatches.has(comName1) || checkExistingMatches.has(comName2)) {
                setMatchError(`Error on line ${x + 1}: Teams ${team1} and ${team2} have already played against each other. Check current inputs or previously added match results`);
                return;
            }
            checkExistingMatches.add(comName1)
        }

        setMatchError('');
        const userData = userInput.map(line => {
            const [team1, team2, score1, score2] = line.trim().split(/\s+/);
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
                alert('Match data has been added successfully!')
            } else {
                const error = await response.json() as ErrorResponse;
                setMatchError(`${error.message}`);
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

    const handleEdit = (match: MatchInput) => {
        setMatchToBeEditted(match);
        setEditInput(`${match.team1} ${match.team2} ${match.score1} ${match.score2}`);
        setShowEditModal(true);
    };

    const handleEditSubmit = async () => {
        if (matchToBeEditted === null) {
            return
        }

        // Check that no data is entered
        if (editInput.trim().length === 0) {
            setMatchError('No data entered!')
            return
        }

        // Check that only 1 line of data is entered for editing
        const numOfInputLines = editInput.trim().split('\n').length
        if (numOfInputLines > 1) {
            setMatchError('Only 1 line of input is accepted for editing.')
            return
        }

        const [team1, team2, score1, score2] = editInput.trim().split(/\s+/);
        if (!team1 || !team2 || !score1 || !score2) {
            setMatchError('Must contain exactly 4 fields (Team 1, Team 2, Team 1 goals, Team 2 goals)');
            return;
        } 

        // Check that both team name are not the same
        if (team1 === team2) {
            setMatchError('Both team names cannot be the same')
            return
        }

        const score1num = parseInt(score1)
        const score2num = parseInt(score2)

        // Check that the score is legit
        if (isNaN(score1num) || isNaN(score2num)) {
            setMatchError('Scores must be valid numbers');
            return;
        }
        
        // Check that the scores are not negative
        if (score1num < 0 || score2num < 0) {
            setMatchError('Scores cannot be negative');
            return;
        }

        const trimmedInput = editInput.trim()
        try {
            const response = await fetch('/api/matches', {
                method: 'PUT',
                headers: {'Content-Type': 'application/json',},
                body: JSON.stringify({
                    trimmedInput, matchToBeEditted, userId
                }),
            })

            if (response.ok) {
                const updatedResponse = await fetch(`/api/matches?userId=${userId}`);
                const updatedData = await updatedResponse.json() as MatchesGetResponse;
                setMatches(updatedData.matches);
                setMatchToBeEditted(null)
                setEditInput('')
                setShowEditModal(false)
                setMatchError('')
                alert('Match results updated!')
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

    return (
        <div className='min-h-screen flex flex-col p-4'>
            {isPageLoading ? (
                <div className="flex justify-center items-center min-h-screen">
                    <p>Loading...</p>
                </div>
            ) : (
                <>
                    <div className="flex justify-end mb-4 space-x-4 p-4">
                        <button onClick={() => setShowMatchesModal(true)} disabled={isAddMatchesDisabled}
                            className={`px-4 py-2 rounded-lg mr-4 w-30 ${isAddMatchesDisabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white'}`}
                        >
                            {isAddMatchesDisabled ? 'Round 1 over!' : 'Add Match Results'}
                        </button>
                        <button onClick={handleDeleteAllData} className="bg-red-500 text-white px-4 py-2 rounded-lg">
                            Delete All Data
                        </button>
                    </div>
                    <div className="flex p-4 flex-grow justify-center space-x-8">
                        <div className="flex justify-center w-[80%]">
                            <MatchPageTable matches={matches} onEdit={handleEdit} />
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

                    {showEditModal && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm p-2">
                            <div className="w-[700px] bg-white rounded flex flex-col p-6 ">
                                <h2 className="text-2xl text-center mb-4">Edit Team Details</h2>
                                <textarea 
                                    value={editInput}
                                    onChange={(e) => setEditInput(e.target.value)}
                                    rows={12}
                                    placeholder="Enter teams data here..."
                                    className="rounded-lg p-4 mt-2 text-lg border-2 border-black mb-4"
                                />
                                {matchError && <p className="text-red-500 mt-2">{matchError}</p>}
                                <div className="flex justify-between mt-4 px-4">
                                    <button onClick={handleEditSubmit} className="px-4 py-2 text-white bg-green-500 border border-green-700 rounded-lg">Submit</button>
                                    <button onClick={() => {
                                        setMatchError('');
                                        setEditInput('');
                                        setMatchToBeEditted(null)
                                        setShowEditModal(false);
                                    }} className="px-4 py-2 text-white bg-red-500 border border-red-700 rounded-lg">Cancel</button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
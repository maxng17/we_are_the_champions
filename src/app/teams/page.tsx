'use client'

import { useEffect, useState } from "react";
import TeamTable from "../_components/teamTable";
import { useAuth } from "@clerk/nextjs";
import {Team, ErrorResponse}  from "../_types/types";

interface TeamsGetResponse {
    teams: Team[];
}

export default function TeamPage() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [showTeamsModal, setShowTeamsModal] = useState(false);
    const [teamsInput ,setTeamsInput] = useState('');
    const [teamError, setTeamError] = useState('');

    const {userId} = useAuth(); 

    const isAddTeamsDisabled =teams.length >= 12;

    useEffect(() => {
        if (userId) {
            const fetchTeams = async () => {
                try {
                    const response = await fetch(`/api/teams?userId=${userId}`);
                    if (!response.ok) {
                        throw new Error('Network response not ok');
                    }
                    const data = await response.json() as TeamsGetResponse;
                    setTeams(data.teams);
                } catch (error) {
                    console.error('Error fetching teams:', error);
                }
            };
    
            const fetchData = async () => {
                await fetchTeams();
            };
    
            fetchData().catch(error => console.error('Error in fetching teams:', error));
        }
    }, [userId]);

    const handleTeamSubmit = async () => {
        if (teamsInput.trim().length === 0) {
            setTeamError('No data entered!')
            return
        }
        const userInput = teamsInput.split('\n').filter(line => line.trim() != '')
        if (userInput.length === 0) {
            setTeamError('No data entered!')
            return
        }

        for (let x = 0; x < userInput.length; x++) {
            const line = userInput[x]?.trim()
            if (!line) {
                continue;
            }

            const fields = line.split(' ');

            if (fields.length !== 3) {
                setTeamError(`Error on line ${x + 1}: Each line must contain exactly three fields (Name, Registration Date, Group Number).`);
                return;
            }

            const [name, registrationDate, groupNumber] = fields;

            if (!name || !registrationDate || !groupNumber) {
                setTeamError(`Error on line ${x + 1}: All fields are required (Name, Registration Date, Group Number)`);
                return;
            }
        }

        setTeamError('');
        const userData = userInput.map(line => {
            const [name, registrationDate, groupNumber] = line.trim().split(' ');
            return { name, registrationDate, groupNumber };
        });
        const userIdInput = userId

        try {
            const response = await fetch('/api/teams', {
                method: 'POST',
                headers: {'Content-Type': 'application/json' },
                body: JSON.stringify({userIdInput, userData})
            });

            if (response.ok) {
                const updatedResponse = await fetch(`/api/teams?userId=${userIdInput}`);
                const updatedData = await updatedResponse.json() as TeamsGetResponse;
                setTeams(updatedData.teams);
                setTeamsInput('')
                setShowTeamsModal(false)
            } else {
                const error = await response.json() as ErrorResponse;
                setTeamError(`Error: ${error.message}`);
            }
        } catch (error) {
            const e = error as Error;
            setTeamError('Error occured while submitting the data. Please try again!')
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
                setTeams([]);
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
                <button onClick={() => setShowTeamsModal(true)} className="bg-blue-500 text-white px-4 py-2 rounded-lg mr-4 w-30">
                    Add Teams
                </button>
                <button onClick={handleDeleteAllData} className="bg-red-500 text-white px-4 py-2 rounded-lg">
                    Delete All Data
                </button>
            </div>
            <div className="flex p-4 flex-grow justify-center space-x-8">
                <div className="flex justify-center w-[80%]">
                    <TeamTable teams={teams} />
                </div>
            </div>

            {showTeamsModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm p-2">
                    <div className="w-[700px] bg-white rounded flex flex-col p-6 ">
                        <h2 className="text-2xl text-center mb-4">Add Team Details</h2>
                        <textarea 
                            value={teamsInput}
                            onChange={(e) => setTeamsInput(e.target.value)}
                            rows={12}
                            placeholder="Enter teams data here..."
                            className="rounded-lg p-4 mt-2 text-lg border-2 border-black mb-4"
                        />
                        {teamError && <p className="text-red-500 mt-2">{teamError}</p>}
                        <div className="flex justify-between mt-4 px-4">
                            <button onClick={handleTeamSubmit} className="px-4 py-2 text-white bg-green-500 border border-green-700 rounded-lg">Submit</button>
                            <button onClick={() => {
                                setTeamError('');
                                setTeamsInput('');
                                setShowTeamsModal(false);
                            }} className="px-4 py-2 text-white bg-red-500 border border-red-700 rounded-lg">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
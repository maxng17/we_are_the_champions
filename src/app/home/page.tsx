'use client'

import { useState } from "react";
import TeamTable from "../_components/teamTable";
import MatchesTable from "../_components/matchesTable";

export default function StartPage() {
    const [teams, setTeams] = useState([]);
    const [matches, setMatches] = useState([])

    const [showTeamsModal, setShowTeamsModal] = useState(false)
    const [showMatchesModal, setShowMatchesModal] = useState(false)

    const [teamsInput ,setTeamsInput] = useState('')
    const [matchesInput, setMatchesInput] = useState('')

    const [teamError, setTeamError] = useState('');
    const [matchError, setMatchError] = useState('');

    const isAddTeamsDisabled =teams.length >= 12;
    const isAddMatchesDisabled = teams.length >= 20;

   const handleTeamSubmit = () => {
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
                setTeamError(`Error on line ${x + 1}: The line is empty.`);
                return;
            }
            const [name, registrationDate, groupNumber] = line.split(' ');

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

        try {
            userData.map(data => console.log(data))
            setTeamsInput('')
            setShowTeamsModal(false)
        } catch (error) {
            setTeamError('Error occured while submitting the data. Please try again!')
            console.log(error)
        }
   }
   
   const handleMatchSubmit = () => {
        if (!matchesInput.trim()) {
            setMatchError('No data entered!')
            return 
        }
        const userInput = matchesInput.split('\n').filter(line => line.trim() != '')
        if (matchesInput.length === 0) {
            setMatchError('No data entered!')
            return
        }

        for (let x = 0; x < matchesInput.length; x++) {
            const line = matchesInput[x]?.trim()
            if (!line) {
                continue
            }
            const [team1, team2, score1, score2] = line.split(' ');

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

        try {
            userData.map(data => console.log(data))
            setMatchesInput('')
            setShowMatchesModal(false)
        } catch (error) {
            setMatchError('Error occured while submitting the data. Please try again!')
            console.log(error)
        }
   }

    return (
        <div className='min-h-screen flex flex-col p-4'>
            <div className="flex justify-end mb-4 space-x-4 p-4">
                <button onClick={() => setShowTeamsModal(true)} className="bg-blue-500 text-white px-4 py-2 rounded-lg mr-4 w-30">
                    Add Teams
                </button>
                <button onClick={() => setShowMatchesModal(true)} className="bg-blue-500 text-white px-4 py-2 rounded-lg mr-4">
                    Add Match Results
                </button>
            </div>
            <div className="flex p-4 flex-grow justify-center space-x-8">
                <div className="flex justify-center w-[40%]">
                    <TeamTable teams={teams} />
                </div>
                <div className="flex justify-center w-[40%]">
                    <MatchesTable matches={matches} />
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
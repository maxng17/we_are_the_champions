'use client'

import { useEffect, useState } from "react";
import TeamTable from "../_components/teamTable";
import { useAuth } from "@clerk/nextjs";
import {type Team, type ErrorResponse}  from "../_types/types";

interface TeamsGetResponse {
    teams: Team[];
}

export default function TeamPage() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [showTeamsModal, setShowTeamsModal] = useState(false);
    const [teamsInput ,setTeamsInput] = useState('');

    const [teamError, setTeamError] = useState('');
    const [pageError, setPageError] = useState('');

    const [teamToBeEditted, setTeamToBeEditted] = useState<Team | null>(null);
    const [editInput, setEditInput] = useState('');
    const [showEditModal, setShowEditModal] = useState(false)

    const [isPageLoading, setIsPageLoading] = useState(false);
    const [isModalLoading, setIsModalLoading] = useState(false);
    const [isDeleteLoading, setIsDeleteLoading] = useState(false);

    const {userId} = useAuth(); 
    const isAddTeamsDisabled =teams.length >= 12;

    useEffect(() => {
        if (userId) {
            const fetchTeams = async () => {
                setIsPageLoading(true)
                try {
                    const response = await fetch(`/api/teams?userId=${userId}`);
                    if (!response.ok) {
                        setPageError('Error matching matches. Please refresh the page. If the problem persist, please delete all data and try again.')
                    }
                    const data = await response.json() as TeamsGetResponse;
                    setTeams(data.teams);
                } catch (error) {
                    setPageError('Error matching teams. Please refresh the page. If the problem persist, please delete all data and try again.')
                } finally {
                    setIsPageLoading(false)
                }
            };
    
            const fetchData = async () => {
                await fetchTeams();
            };
    
            fetchData().catch(() => {
                setPageError('Something went wrong. Please refresh the page. If problem persist please delete all data and try again.')
            });
        }
    }, [userId]);

    const handleTeamSubmit = async () => {
        setIsModalLoading(true)

        try {
            // Check if input is empty
            if (teamsInput.trim().length === 0) {
                setTeamError('No data entered!')
                return
            }
            const userInput = teamsInput.split('\n').filter(line => line.trim() != '')

            const currentcount = teams.length + userInput.length;
            
            // Check only 12 teams in total
            if (currentcount > 12) {
                setTeamError(`There can only be 12 teams in the competitions. `)
                return
            }

            const checkTeamNames = new Set(teams.map(team => team.teamName));
            let group1count = teams.filter(team => team.groupNumber === '1').length;
            let group2count = teams.filter(team => team.groupNumber === '2').length;

            for (let x = 0; x < userInput.length; x++) {
                const line = userInput[x]

                if (!line) {
                    setTeamError(`Error on line ${x + 1}: Invalid input. Refresh the page and try again if error persist.`);
                    return;
                }

                const fields = line.trim().split(/\s+/);

                // Check correct number of fields
                if (fields.length !== 3) {
                    setTeamError(`Error on line ${x + 1}: Each line must contain exactly three fields (Name, Registration Date, Group Number).`);
                    return;
                }

                const [nName, nRegistrationDate, nGroupNumber] = fields;

                if (!nName || !nRegistrationDate || !nGroupNumber) {
                    setTeamError(`Error on line ${x + 1}: All fields are required (Name, Registration Date, Group Number)`);
                    return;
                }

                // Check that the name is not taken
                if (checkTeamNames.has(nName)) {
                    setTeamError(`Error on line ${x + 1}: Team name "${nName}" is already taken.`);
                    return;
                }
                checkTeamNames.add(nName);

                if (nGroupNumber !== '1' && nGroupNumber !== '2') {
                    setTeamError(`Error on line ${x + 1}: Group number must be either 1 or 2.`)
                    return 
                }

                // Check if the reg date is legit
                const dateArr = nRegistrationDate.split('/');
                if (dateArr[0]?.length !== 2 || dateArr[1]?.length !== 2) {
                    setTeamError(`Error on line ${x + 1}: Invalid registration date. Ensure that it is in the format: DD/MM.`);
                    return;
                }
                const day = parseInt(dateArr[0] ?? '0');
                const month = parseInt(dateArr[1] ?? '0');

                // Check for valid date
                if (isNaN(day) || isNaN(month) || day < 1 || day > 31 || month < 1 || month > 12) {
                    setTeamError(`Error on line ${x + 1}: Invalid registration date. Please check the day and month.`);
                    return;
                }

                const regDate = new Date(2024, month - 1, day);
                const isValidDate = regDate.getDate() === day && regDate.getMonth() === month - 1;

                // Check for valid date
                if (!isValidDate) {
                    setTeamError(`Error on line ${x + 1}: Invalid registration date. Please check the day and month.`);
                    return;
                }

                //Check that the number of teams per group do not exceed 6
                if (nGroupNumber === '1' && group1count >= 6) {
                    setTeamError(`Error on line ${x + 1}: Group ${nGroupNumber} already has the maximum number of 6 teams.`);
                    return;
                } else if (nGroupNumber === '2' && group2count >= 6) {
                    setTeamError(`Error on line ${x + 1}: Group 2 already has the maximum number of 6 teams.`);
                    return;
                }
                
                if (nGroupNumber ==='1') {
                    group1count +=1
                } else {
                    group2count += 1
                }
                
            }

            setTeamError('');
            const userData = userInput.map(line => {
                const [name, registrationDate, groupNumber] = line.trim().split(/\s+/);
                return { name, registrationDate, groupNumber };
            });
            const userIdInput = userId

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
                alert('Team data has been added successfully!.');
            } else {
                const error = await response.json() as ErrorResponse;
                if (response.status === 400) {
                    setTeamError(`${error.message}`);
                } else {
                    setTeamError(`Something went wrong. Please refresh the page. If problem persists, please delete all data and try again.`)
                }
            }
        } catch (error) {
            setTeamError('Error occured while submitting the data. Please refresh the page. If problem persists, please delete all data and try again.')
        } finally {
            setIsModalLoading(false)
        }
    }

    const handleDeleteAllData = async() => {
        if (!window.confirm("Are you sure you want to delete all team and match data? This action cannot be undone.")) {
            return
        } 
        setIsDeleteLoading(true)
        try {
            const response = await fetch(`/api/deleteAll?userId=${userId}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                setTeams([]);
                alert('All team and match data has been deleted.');
            } else {
                alert('Failed to delete data.');
            }
        } catch (error) {
            alert('An error occurred while deleting the data.');
        } finally {
            setIsDeleteLoading(false)
        }
    }

    const handleEdit = (team: Team) => {
        setTeamToBeEditted(team);
        setEditInput(`${team.teamName} ${team.registrationDate} ${team.groupNumber}`);
        setShowEditModal(true);
    };

    const handleEditSubmit = async () => {
        setIsModalLoading(true)
        try {

            if (teamToBeEditted === null) {
                return
            }
            
            // Check if data is entered
            if (editInput.trim().length === 0) {
                setTeamError('No data entered!')
                return
            }

            // Ensure only 1 line of data is entered
            const numOfInputLines = editInput.trim().split('\n').length
            if (numOfInputLines > 1) {
                setTeamError('Only 1 line of input is accepted for editing.')
                return
            }

            // Check for only 3 fields
            const [name, registrationDate, groupNumber] = editInput.trim().split(/\s+/);
            if (!name || !registrationDate || !groupNumber) {
                setTeamError('Must contain exactly three fields (Name, Registration Date, Group Number)');
                return;
            } 

            // Check for name uniqueness
            if (name !== teamToBeEditted.teamName) {
                const isNameTaken = teams.some(team => team.teamName === name);
                if (isNameTaken) {
                    setTeamError('Team name is already being taken.');
                    return;
                }
            }

            // Check that group number is either 1 or 2
            if (groupNumber !== '1' && groupNumber !== '2') {
                setTeamError('Group number must be either 1 or 2.');
                return;
            }

            // DateReg check if legit
            const dateArr = registrationDate.split('/');
            if (dateArr[0]?.length !== 2 || dateArr[1]?.length !== 2) {
                setTeamError('Invalid registration date. Ensure that it is in the format: DD/MM')
                return
            }
            const day = parseInt(dateArr[0] ?? '0');
            const month = parseInt(dateArr[1] ?? '0');

            if (isNaN(day) || isNaN(month) || day < 1 || day > 31 || month < 1 || month > 12) {
                setTeamError('Invalid registration date. Please check the day and month.');
                return;
            }

            const regDate = new Date(2024, month - 1, day);
            const isValidDate = regDate.getDate() === day && regDate.getMonth() === month - 1;

            if (!isValidDate) {
                setTeamError('Invalid registration date. Please check the day and month.');
                return;
            }

            const trimmedInput = editInput.trim()

            const response = await fetch('/api/teams', {
                method: 'PUT',
                headers: {'Content-Type': 'application/json',},
                body: JSON.stringify({
                    trimmedInput, teamToBeEditted, userId
                }),
            })

            if (response.ok) {
                const updatedResponse = await fetch(`/api/teams?userId=${userId}`);
                const updatedData = await updatedResponse.json() as TeamsGetResponse;
                setTeams(updatedData.teams);
                setTeamToBeEditted(null)
                setEditInput('')
                setShowEditModal(false)
                setTeamError('')
                alert('Team data has been editted successfully!.');
            } else {
                const error = await response.json() as ErrorResponse;
                if (response.status === 400 || response.status === 404) {
                    setTeamError(`${error.message}`);
                } else {
                    setTeamError('Something went wrong. Please refresh the page. If problem persists, please delete all data and try again.')
                }
            }
        } catch (error) {
            setTeamError('Error occured while editing the data. Please refresh the page. If problem persists, please delete all data and try again.')
        } finally {
            setIsModalLoading(false)
        }
    }

    return (
        <div className='min-h-screen flex flex-col p-4'>
            {isPageLoading ? (
                <div className="flex justify-center items-center min-h-screen">
                    <p>Loading...</p>
                </div>
            ) : 
            pageError ? (
                <div className="flex justify-center items-center min-h-screen">
                    {pageError}
                </div>
            ) : (
                <>
                <div className="flex justify-end mb-4 space-x-4 p-4">
                    <button onClick={() => setShowTeamsModal(true)}  disabled={isAddTeamsDisabled}
                        className={`px-4 py-2 rounded-lg mr-4 w-30 ${isAddTeamsDisabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white'}`}
                    >
                        {isAddTeamsDisabled ? 'All teams registered' : 'Add Teams'}
                    </button>
                    <button 
                        onClick={handleDeleteAllData}
                        className={`px-4 py-2 rounded-lg ${isDeleteLoading ? 'bg-gray-500' : 'bg-red-500'} text-white`}
                        disabled= {isDeleteLoading}
                    >
                        {isDeleteLoading? 'Deleting...' : 'Delete All Data'}
                    </button>
                </div>
                <div className="flex p-4 flex-grow justify-center space-x-8">
                    <div className="flex justify-center w-[80%]">
                        <TeamTable teams={teams} onEdit={handleEdit} />
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
                                disabled={isModalLoading}
                            />
                            {teamError && <p className="text-red-500 mt-2">{teamError}</p>}
                            <div className="flex justify-between mt-4 px-4">
                                <button 
                                    onClick={handleTeamSubmit} 
                                    className={`px-4 py-2 rounded-lg ${isModalLoading ? 'bg-gray-500' : 'bg-green-500'} text-white`}
                                >
                                    {isModalLoading? 'Submitting...': 'Submit'}
                                </button>
                                <button onClick={() => {
                                    setTeamError('');
                                    setTeamsInput('');
                                    setShowTeamsModal(false);
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
                                disabled={isModalLoading}
                            />
                            {teamError && <p className="text-red-500 mt-2">{teamError}</p>}
                            <div className="flex justify-between mt-4 px-4">
                                <button 
                                    onClick={handleEditSubmit} 
                                    className={`px-4 py-2 rounded-lg ${isModalLoading ? 'bg-gray-500' : 'bg-green-500'} text-white`}
                                >
                                    {isModalLoading? 'Submitting...': 'Submit'}
                                </button>
                                <button onClick={() => {
                                    setTeamError('');
                                    setEditInput('');
                                    setTeamToBeEditted(null)
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
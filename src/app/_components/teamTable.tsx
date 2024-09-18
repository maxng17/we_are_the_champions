import Link from "next/link"
import { type Team } from "../_types/types"

interface TeamTableProps {
    teams: Team[]
    onEdit: (team: Team) => void;
}
export default function TeamTable({ teams, onEdit }: TeamTableProps) {
    return (
        <div className="w-full">
            <h2 className="text-xl font-bold mb-2 text-center">Teams</h2>
            <table className="table-fixed w-full border-collapse border border-gray-200">
                <thead>
                    <tr>
                        <th className="w-1/4 px-4 py-2 border border-gray-300">Team Name</th>
                        <th className="w-1/4 px-4 py-2 border border-gray-300">Registration Date</th>
                        <th className="w-1/4 px-4 py-2 border border-gray-300">Group</th>
                        <th className="w-1/4 px-4 py-2 border border-gray-300">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {teams.length ? (
                        teams.map((team, idx) => (
                            <tr key={idx}>
                                <td className="px-4 py-2 border border-gray-300 text-center">
                                    <Link href={`/teams/${team.teamName}`} className="text-blue-500 hover:underline">
                                        {team.teamName}
                                    </Link>
                                </td>
                                <td className="px-4 py-2 border border-gray-300 text-center">{team.registrationDate}</td>
                                <td className="px-4 py-2 border border-gray-300 text-center">{team.groupNumber}</td>
                                <td className="px-4 py-2 border border-gray-300 text-center">
                                    <button 
                                        onClick={() => onEdit(team)} 
                                        className="bg-yellow-500 text-white px-4 py-2 rounded-lg"
                                    >
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4} className="px-4 py-2 border border-gray-300 text-center">No teams entered yet!</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
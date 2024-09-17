import { Team } from "../_types/types"

interface TeamTableProps {
    teams: Team[]
}

export default function TeamTable( {teams}  : TeamTableProps) {
    return (
        <div className="w-full">
            <h2 className="text-xl font-bold mb-2 text-center">Teams</h2>
            <table className="table-fixed w-full border-collapse border border-gray-200">
                <thead>
                    <tr>
                        <th className="w-1/3 px-4 py-2 border border-gray-300">Team Name</th>
                        <th className="w-1/3 px-4 py-2 border border-gray-300">Group</th>
                        <th className="w-1/3 px-4 py-2 border border-gray-300">Registration Date</th>
                    </tr>
                </thead>
                <tbody>
                    {teams.length ? (
                        teams.map((team, idx) => (
                            <tr key={idx}>
                                <td className="px-4 py-2 border border-gray-300 text-center">{team.teamName}</td>
                                <td className="px-4 py-2 border border-gray-300 text-center">{team.groupNumber}</td>
                                <td className="px-4 py-2 border border-gray-300 text-center">{team.registrationDate}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={3} className="px-4 py-2 border border-gray-300 text-center">No teams entered yet!</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}
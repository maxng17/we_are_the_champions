import { MatchInput } from "../_types/types"

interface MatchPageTableProps {
    matches: MatchInput[]
    onEdit: (matchResults: MatchInput) => void;
}

export default function MatchPageTable( {matches, onEdit}  : MatchPageTableProps) {
    return (
        <div className="w-full">
            <h2 className="text-xl font-bold mb-2 text-center">Match Results</h2>
            <table className="table-fixed w-full border-collapse border border-gray-200">
                <thead>
                    <tr>
                        <th className="w-1/5 px-4 py-2 border border-gray-300">Team A</th>
                        <th className="w-1/5 px-4 py-2 border border-gray-300">Team B</th>
                        <th className="w-1/5 px-4 py-2 border border-gray-300">Team A Score</th>
                        <th className="w-1/5 px-4 py-2 border border-gray-300">Team B Score</th>
                        <th className="w-1/5 px-4 py-2 border border-gray-300">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {matches.length ? (
                        matches.map((match, idx) => (
                            <tr key={idx}>
                                <td className="px-4 py-2 border border-gray-300 text-center">{match.team1}</td>
                                <td className="px-4 py-2 border border-gray-300 text-center">{match.team2}</td>
                                <td className="px-4 py-2 border border-gray-300 text-center">{match.score1}</td>
                                <td className="px-4 py-2 border border-gray-300 text-center">{match.score2}</td>
                                <td className="px-4 py-2 border border-gray-300 text-center">
                                    <button 
                                        onClick={() => onEdit(match)} 
                                        className="bg-yellow-500 text-white px-4 py-2 rounded-lg"
                                    >
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="px-4 py-2 border border-gray-300 text-center">No match results entered yet!</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}
import { MatchInput } from "../_types/types"

interface MatchTableProps {
    matches: MatchInput[]
}

export default function MatchesTable( {matches}  : MatchTableProps) {
    return (
        <div className="w-full">
            <h2 className="text-xl font-bold mb-2 text-center">Match Results</h2>
            <table className="table-fixed w-full border-collapse border border-gray-200">
                <thead>
                    <tr>
                        <th className="w-1/3 px-4 py-2 border border-gray-300">Team A</th>
                        <th className="w-1/3 px-4 py-2 border border-gray-300">Scores</th>
                        <th className="w-1/3 px-4 py-2 border border-gray-300">Team B</th>
                    </tr>
                </thead>
                <tbody>
                    {matches.length ? (
                        matches.map((match, idx) => (
                            <tr key={idx}>
                                <td className="px-4 py-2 border border-gray-300 text-center">{match.team1}</td>
                                <td className="px-4 py-2 border border-gray-300 text-center">{match.score1 + '  -  ' + match.score2}</td>
                                <td className="px-4 py-2 border border-gray-300 text-center">{match.team2}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={3} className="px-4 py-2 border border-gray-300 text-center">No match results entered yet!</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}
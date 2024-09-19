import { type MatchInput } from "../_types/types"

interface MatchTableProps {
    matches: MatchInput[]
    teamName: string
}

export default function MatchesTable( {matches, teamName}  : MatchTableProps) {
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
                        matches.map((match, idx) => {
                            const isTeam1 = match.team1 === teamName;
                            let colorClass = '';

                            if (isTeam1) {
                                colorClass = match.score1 > match.score2 ? 'bg-green-200' : (match.score1 < match.score2 ? 'bg-red-200' : 'bg-gray-300');
                            } else {
                                colorClass = match.score2 > match.score1 ? 'bg-green-200' : (match.score2 < match.score1 ? 'bg-red-200' : 'bg-gray-300');
                            }

                            return (
                                <tr key={idx}>
                                    <td className={`px-4 py-2 border border-gray-300 text-center ${colorClass}`}>
                                        {isTeam1? match.team1: match.team2}
                                    </td>
                                    <td className="px-4 py-2 border border-gray-300 text-center">
                                        {isTeam1 ? `${match.score1} - ${match.score2}` : `${match.score2} - ${match.score1}`}
                                    </td>
                                    <td className={`px-4 py-2 border border-gray-300 text-center`}>
                                        {isTeam1? match.team2: match.team1}
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={3} className="px-4 py-2 border border-gray-300 text-center">No match results entered yet!</td>
                        </tr>
                    )}
                </tbody>
            </table>
            <div className="mt-4">
                <p><span className="inline-block px-3 py-1 bg-green-200 text-black w-16">Wins</span></p>
                <p><span className="inline-block px-3 py-1 bg-red-200 text-black w-16">Losts</span></p>
                <p><span className="inline-block px-3 py-1 bg-gray-300 text-black w-16">Draws</span></p>
            </div>
        </div>
    )
}
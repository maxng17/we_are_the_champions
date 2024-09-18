import { type LeaderBoardsData } from "../_types/types";

interface LeaderTableProps {
    teamData : LeaderBoardsData[],
    groupName : string
}

export default function LeaderBoardTable( {teamData, groupName}  : LeaderTableProps) {
    return (
        <div className="w-full">
            <h2 className="text-xl font-bold mb-2 text-center">{'Team' + groupName}</h2>
            <table className="table-fixed w-full border-collapse border border-gray-200">
                <thead>
                    <tr>
                        <th className="w-1/3 px-4 py-2 border border-gray-300">Pos</th>
                        <th className="w-1/3 px-4 py-2 border border-gray-300">Team Name</th>
                        <th className="w-1/3 px-4 py-2 border border-gray-300">Wins</th>
                        <th className="w-1/3 px-4 py-2 border border-gray-300">Losts</th>
                        <th className="w-1/3 px-4 py-2 border border-gray-300">Ties</th>
                        <th className="w-1/3 px-4 py-2 border border-gray-300">Points</th>
                        <th className="w-1/3 px-4 py-2 border border-gray-300">Goals</th>
                        <th className="w-1/3 px-4 py-2 border border-gray-300">Alternate score</th>
                    </tr>
                </thead>
                <tbody>
                    {teamData.length ? (
                        teamData.map((data, idx) => {
                            let rowClassName = '';
                            if (idx < 4) {
                                rowClassName = 'bg-green-200';
                            } else {
                                rowClassName = 'bg-red-200';
                            }
                            return (
                                <tr key={idx} className={rowClassName}>
                                    <td className="px-4 py-2 border border-gray-300 text-center">{idx + 1}</td>
                                    <td className="px-4 py-2 border border-gray-300 text-center">{data.teamName}</td>
                                    <td className="px-4 py-2 border border-gray-300 text-center">{data.winsNum}</td>
                                    <td className="px-4 py-2 border border-gray-300 text-center">{data.lostsNum}</td>
                                    <td className="px-4 py-2 border border-gray-300 text-center">{data.drawsNum}</td>
                                    <td className="px-4 py-2 border border-gray-300 text-center">{data.totalPoints}</td>
                                    <td className="px-4 py-2 border border-gray-300 text-center">{data.totalScoreNum}</td>
                                    <td className="px-4 py-2 border border-gray-300 text-center">{data.alternatePoints}</td>
                                </tr>)
                        })
                    ) : (
                        <tr>
                            <td colSpan={8} className="px-4 py-2 border border-gray-300 text-center">No match results entered yet!</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}
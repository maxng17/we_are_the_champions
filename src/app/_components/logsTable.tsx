import Link from "next/link";
import { type DataLog } from "../_types/types";

interface LeaderTableProps {
    logDatas : DataLog[],
}

export default function LogsTable( {logDatas}  : LeaderTableProps) {
    return (
        <div className="w-full">
            <h2 className="text-xl font-bold mb-2 text-center">Logs of all data changes</h2>
            <div className="mb-6 text-center">
                <p className="mt-2 text-gray-600">
                    This is the log page. Here, you can view records of actions performed.
                </p>
                <p className="mt-1 text-gray-600">
                    The operations logged are either <strong>delete</strong>, <strong>add</strong>, or <strong>edit</strong>.
                </p>
                <p className="mt-1 text-gray-600">
                    The data types logged include <strong>team data</strong> and <strong>match results data</strong>.
                </p>
            </div>
            <table className="table-fixed w-full border-collapse border border-gray-200">
                <thead>
                    <tr>
                        <th className="w-1/4 px-4 py-2 border border-gray-300">NO.</th>
                        <th className="w-1/4 px-4 py-2 border border-gray-300">Operation</th>
                        <th className="w-1/4 px-4 py-2 border border-gray-300">Data Type</th>
                        <th className="w-1/4 px-4 py-2 border border-gray-300">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {logDatas.length ? (
                        logDatas.map((data, idx) => {
                            return (
                                <tr key={idx}>
                                    <td className="px-4 py-2 border border-gray-300 text-center">{idx+1}</td>
                                    <td className="px-4 py-2 border border-gray-300 text-center">{data.operation}</td>
                                    <td className="px-4 py-2 border border-gray-300 text-center">
                                        {data.operation === 'DELETE' ? '' : data.dataType}
                                    </td>
                                    <td className="px-4 py-2 border border-gray-300 text-center">
                                        {data.operation === 'DELETE' ? '' : (
                                            <Link href={`/logs/${data.groupId}`} className="text-blue-500 hover:underline">
                                                View More details
                                            </Link>
                                        )}
                                    </td>
                                </tr>)
                        })
                    ) : (
                        <tr>
                            <td colSpan={4} className="px-4 py-2 border border-gray-300 text-center">No logs found!</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}
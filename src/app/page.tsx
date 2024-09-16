import Link from "next/link";
import { db } from "~/server/db";

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const data = await db.query.teams.findMany()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      {data.map((team) => (
        <div key={team.id}>{team.name}</div>
      ))}
    </main>
  );
}

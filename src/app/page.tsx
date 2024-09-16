import Link from "next/link";

export default async function HomePage() {

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="font-bold text-3xl">
        Govtech Annual Soccer
      </h1>
      <Link href='/sign-up'>
        <span className="text-blue-500 underline text-lg hover:text-blue-700">
          Create an account now!
        </span>
      </Link>
    </main>
  );
}

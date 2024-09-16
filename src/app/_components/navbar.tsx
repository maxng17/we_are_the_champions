import {SignedIn, SignedOut, SignInButton, UserButton} from '@clerk/nextjs'
import Link from 'next/link'

export default function TopNav() {
    return (
      <nav className='flex w-full items-center justify-between border-b p-5 text-xl'>
        <div className='flex space-x-10'>
          <Link href="/home">Home</Link>
          <Link href="/leaderboard">Leaderboard</Link>
          <Link href="/logs">Logs</Link>
        </div>
        <div>
            <SignedOut>
              <SignInButton fallbackRedirectUrl='/home'/>
            </SignedOut>
            <SignedIn>
                <UserButton />
            </SignedIn>
        </div>
      </nav>
    )
}

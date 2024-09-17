import { SignIn } from '@clerk/nextjs'

export default function SigninPage() {
  return (
    <div className='flex justify-center'>
        <SignIn path='/sign-in' routing='path' signUpUrl='/sign-up' forceRedirectUrl='/teams' fallbackRedirectUrl='teams'/>
    </div>
  )
}
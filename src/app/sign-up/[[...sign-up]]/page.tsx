import { SignUp } from '@clerk/nextjs'

export default function SignupPage() {
  return (
    <div className='flex justify-center'>
        <SignUp path='/sign-up' routing='path' signInUrl='/sign-in' signInFallbackRedirectUrl="/teams"/>
    </div>
  )
}
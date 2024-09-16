import { auth } from "@clerk/nextjs/server";

export default function StartPage() {

    const {userId} = auth();

    return (
        <div>
            <h1>
                this is the home page
            </h1>
            <h1>
                Hello, {userId}
            </h1>
        </div>
    )
}
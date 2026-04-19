import { SignUp } from "@clerk/clerk-react";

export default function SignUpPage() {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--background)' }}>
            <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
        </div>
    );
}

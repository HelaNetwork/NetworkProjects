import { SignIn } from "@clerk/clerk-react";

export default function HRSignIn() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--background)' }}>
            <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>HR Access</h2>
            <SignIn
                path="/hr/sign-in"
                routing="path"
                signUpUrl="/sign-up"
                afterSignInUrl="/hr"
            />
        </div>
    );
}

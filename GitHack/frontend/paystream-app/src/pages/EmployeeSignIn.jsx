import { SignIn } from "@clerk/clerk-react";

export default function EmployeeSignIn() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--background)' }}>
            <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Employee Access</h2>
            <SignIn
                path="/employee/sign-in"
                routing="path"
                signUpUrl="/sign-up"
                afterSignInUrl="/employee"
            />
        </div>
    );
}

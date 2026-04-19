import './index.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import LandingPage from './pages/LandingPage';
import HRDashboard from './components/hr/Dashboard';
import EmployeeDashboard from './components/employee/EmployeeDashboard';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import HRSignIn from './pages/HRSignIn';
import EmployeeSignIn from './pages/EmployeeSignIn';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />

                <Route
                    path="/hr"
                    element={
                        <>
                            <SignedIn>
                                <HRDashboard />
                            </SignedIn>
                            <SignedOut>
                                <RedirectToSignIn />
                            </SignedOut>
                        </>
                    }
                />

                <Route
                    path="/employee"
                    element={
                        <>
                            <SignedIn>
                                <EmployeeDashboard />
                            </SignedIn>
                            <SignedOut>
                                <RedirectToSignIn />
                            </SignedOut>
                        </>
                    }
                />

                <Route path="/hr/sign-in/*" element={<HRSignIn />} />
                <Route path="/employee/sign-in/*" element={<EmployeeSignIn />} />

                <Route path="/sign-in/*" element={<SignInPage />} />
                <Route path="/sign-up/*" element={<SignUpPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;

import "./styles/dashboard.css";

import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "./firebase";
import { useState, useEffect } from "react";
import { connectWallet } from "./web3/wallet";
import { fetchEmployeeByEmail } from "./supabase";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import HR from "./pages/HR";
import Employee from "./pages/Employee";
import HRRegistration from "./pages/HRRegistration";

/*//////////////////////////////////////////////////////////////
          HR EMAILS — loaded from localStorage + defaults
          New HR registrations are added dynamically
//////////////////////////////////////////////////////////////*/
function getHREmails() {
  const stored = localStorage.getItem('paystream_hr_emails');
  const defaultHR = ["aryandev1606@gmail.com"];
  
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure default HR is always included
      return [...new Set([...defaultHR, ...parsed])];
    } catch {
      return defaultHR;
    }
  }
  return defaultHR;
}

function addHREmail(email) {
  const currentHR = getHREmails();
  if (!currentHR.includes(email)) {
    currentHR.push(email);
    localStorage.setItem('paystream_hr_emails', JSON.stringify(currentHR));
  }
}

function App() {

  const [account, setAccount]           = useState("");
  const [role, setRole]                 = useState("");
  const [email, setEmail]               = useState("");
  const [currentUserData, setCurrentUserData] = useState(null);
  const [loadingUser, setLoadingUser]   = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [hrEmails, setHrEmails]         = useState(getHREmails());

  /*//////////////////////////////////////////////////////////////
                      GOOGLE LOGIN
  //////////////////////////////////////////////////////////////*/

  async function googleLogin() {
    try {
      const result = await signInWithPopup(auth, provider);
      const userEmail = result.user.email;
      setEmail(userEmail);
      setLoadingUser(true);

      // HR check — dynamically loaded from localStorage
      if (hrEmails.includes(userEmail)) {
        setRole("hr");
        setCurrentUserData({ role: "hr", name: "HR Manager", email: userEmail });
        setLoadingUser(false);
        return;
      }

      // Employee — look up from Supabase
      const employeeRecord = await fetchEmployeeByEmail(userEmail);

      if (employeeRecord) {
        setRole("employee");
        setCurrentUserData({
          role:           "employee",
          name:           employeeRecord.name,
          position:       employeeRecord.position,
          salary:         employeeRecord.salary,
          address:        employeeRecord.wallet_address,
          email:          employeeRecord.email,
          id:             employeeRecord.id,
        });
      } else {
        // New user - show registration page
        setShowRegistration(true);
      }

    } catch (err) {
      console.error(err);
      alert("Login failed.");
    } finally {
      setLoadingUser(false);
    }
  }

  /*//////////////////////////////////////////////////////////////
                  REGISTRATION HANDLERS
  //////////////////////////////////////////////////////////////*/

  function handleRegistrationComplete(registrationData) {
    // Check if this is HR or employee registration
    if (registrationData.role === "hr") {
      // HR registration
      addHREmail(email); // Add to localStorage
      setHrEmails(getHREmails()); // Update state
      setRole("hr");
      setCurrentUserData({
        role: "hr",
        name: registrationData.name,
        email: registrationData.email,
      });
    } else {
      // Employee registration
      setRole("employee");
      setCurrentUserData({
        role:           "employee",
        name:           registrationData.name,
        position:       registrationData.position,
        salary:         registrationData.salary,
        address:        registrationData.wallet_address,
        email:          registrationData.email,
        id:             registrationData.id,
      });
    }
    setShowRegistration(false);
  }

  function handleRegistrationCancel() {
    // Cancel registration, go back to login
    setShowRegistration(false);
    setEmail("");
    setRole("");
    setCurrentUserData(null);
  }

  /*//////////////////////////////////////////////////////////////
                      WALLET CONNECT
  //////////////////////////////////////////////////////////////*/

  async function handleConnect() {
    try {
      const addr = await connectWallet();
      setAccount(addr);
    } catch (err) {
      console.error(err);
      alert("Wallet connection failed.");
    }
  }

  /*//////////////////////////////////////////////////////////////
                        LOGIN SCREEN
  //////////////////////////////////////////////////////////////*/

  if (!email) {
    return (
      <div className="login-container">
        <div className="login-box">
          <div className="login-logo">⚡</div>
          <h1 className="login-title">PayStream</h1>
          <p className="login-subtitle">
            Real-time payroll streaming on HeLa Network
          </p>
          <button className="google-btn" onClick={googleLogin}>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  if (loadingUser) {
    return (
      <div className="login-container">
        <div className="login-box">
          <div className="login-logo">⚡</div>
          <p className="login-subtitle">Loading your profile…</p>
        </div>
      </div>
    );
  }

  /*//////////////////////////////////////////////////////////////
                    REGISTRATION SCREEN
  //////////////////////////////////////////////////////////////*/

  if (showRegistration && email) {
    return (
      <HRRegistration
        userEmail={email}
        onRegistrationComplete={handleRegistrationComplete}
        onCancel={handleRegistrationCancel}
      />
    );
  }

  /*//////////////////////////////////////////////////////////////
                          MAIN APP
                NOTE: Role is immutable after login. HR can only see
                HR portal, employees can only see Employee portal.
  //////////////////////////////////////////////////////////////*/

  return (
    <div className="layout">

      <Sidebar
        role={role}
        userData={currentUserData}
      />

      <div className="main">

        <Topbar
          email={email}
          account={account}
          connectWallet={handleConnect}
          role={role}
          userData={currentUserData}
        />

        <div className="content">

          {role === "hr" && <HR />}

          {role === "employee" && (
            <Employee
              account={account}
              userData={currentUserData}
            />
          )}

        </div>
      </div>
    </div>
  );
}

export default App;
function App() {
    const [page, setPage] = React.useState("login");

    if (page === "signup") {
        return <SignupPage onSignup={() => setPage("dashboard")} onGoLogin={() => setPage("login")} />;
    }

    if (page === "dashboard") {
        return <Dashboard onLogout={() => setPage("login")} />;
    }

    return <LoginPage onLogin={() => setPage("dashboard")} onGoSignup={() => setPage("signup")} />;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

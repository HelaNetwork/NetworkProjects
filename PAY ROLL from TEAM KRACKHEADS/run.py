"""
Run everything with a single command.
- Sets up Backend (venv, pip, .env)
- Builds both frontends
- Starts the server
"""
import subprocess
import sys
import os

ROOT = os.path.dirname(os.path.abspath(__file__))
BACKEND = os.path.join(ROOT, "Backend")
FRONTPAGE = os.path.join(ROOT, "frontpage")
EMPLOYEE = os.path.join(ROOT, "Frontendemployee")

def run(cmd, cwd=None):
    cwd = cwd or ROOT
    print(f"\n>>> {cmd}")
    result = subprocess.run(cmd, shell=True, cwd=cwd)
    if result.returncode != 0:
        print(f"Command failed with exit code {result.returncode}")
        sys.exit(result.returncode)

def main():
    print("=" * 55)
    print("  CORE PAYROLL - Starting all services")
    print("=" * 55)

    # --- Backend setup ---
    venv_python = os.path.join(BACKEND, "venv", "Scripts", "python.exe")
    if sys.platform != "win32":
        venv_python = os.path.join(BACKEND, "venv", "bin", "python")
    if not os.path.exists(venv_python):
        print("\n[1/4] Creating Backend venv...")
        run(f'"{sys.executable}" -m venv venv', BACKEND)
    if not os.path.exists(os.path.join(BACKEND, ".env")):
        print("\n[1/4] Creating Backend/.env (SQLite)...")
        with open(os.path.join(BACKEND, ".env"), "w") as f:
            f.write("DATABASE_URL=sqlite:///./blockchain.db\n")
    print("\n[1/4] Installing Backend deps...")
    pip = os.path.join(BACKEND, "venv", "Scripts", "pip.exe") if sys.platform == "win32" else os.path.join(BACKEND, "venv", "bin", "pip")
    run(f'"{pip}" install -r requirements.txt', BACKEND)

    # --- Frontends ---
    print("\n[2/4] Building frontpage...")
    if os.path.exists(os.path.join(FRONTPAGE, "package.json")):
        run("npm install", FRONTPAGE)
        run("npm run build", FRONTPAGE)
    else:
        print("Skipping frontpage (no package.json)")

    print("\n[3/4] Building employee dashboard...")
    if os.path.exists(os.path.join(EMPLOYEE, "package.json")):
        run("npm install", EMPLOYEE)
        run("npm run build", EMPLOYEE)
    else:
        print("Skipping Frontendemployee (no package.json)")

    print("\n[4/4] Starting server...")
    print("\n" + "=" * 55)
    print("  Open:  http://localhost:8000")
    print("  Login: employer@test.com / 123456  (Employer)")
    print("         employee@test.com / 123456  (Employee)")
    print("=" * 55 + "\n")

    subprocess.run(
        [venv_python, "-m", "uvicorn", "main:app", "--reload", "--host", "127.0.0.1"],
        cwd=BACKEND
    )

if __name__ == "__main__":
    main()

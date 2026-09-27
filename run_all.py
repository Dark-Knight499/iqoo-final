"""
Creator AI Studio - Unified Service Launcher
Launches all 3 services concurrently:
  1. Studio Backend (Port 8000) - Projects, Timeline, 3D Scene, Viewfinder, Jog Wheel
  2. Intelligence Backend (Port 8001) - Profiling, Dashboard, Trends, Intelligence, Clipping
  3. Frontend Dev Server (Port 5174) - Vite UI with LAN host enabled
"""

import sys
import subprocess
import signal
import time

import os

def main():
    venv_py = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".venv", "bin", "python")
    py_exec = venv_py if os.path.exists(venv_py) else sys.executable

    print("=" * 65)
    print("  CREATOR AI STUDIO — FULL SYSTEM LAUNCHER")
    print("  1. Studio Backend:        http://localhost:8000 (API & Docs)")
    print("  2. Intelligence Backend:  http://localhost:8001 (Profiling & Trends)")
    print("  3. Static Analysis Server: http://localhost:4174 (Media Intelligence)")
    print("  4. Brainrot Render Engine: http://localhost:8080 (MoneyPrinterTurbo)")
    print("  5. Web / Mobile UI:       http://localhost:5173 / http://localhost:5174")
    print("=" * 65)
    print("Starting services...\n")

    processes = []
    try:
        p1 = subprocess.Popen([py_exec, "backend/run_backend.py"])
        processes.append(("Studio Backend (8000)", p1))

        p2 = subprocess.Popen([py_exec, "backend/intelligence/run.py"])
        processes.append(("Intelligence Backend (8001)", p2))

        p3 = subprocess.Popen(["npm", "--prefix", "legacy/static-analysis", "run", "server:dev"], shell=False)
        processes.append(("Static Analysis Server (4174)", p3))

        mpt_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "MoneyPrinterTurbo")
        mpt_venv_py = os.path.join(mpt_dir, ".venv", "bin", "python")
        mpt_py = mpt_venv_py if os.path.exists(mpt_venv_py) else py_exec
        if os.path.exists(mpt_dir):
            p4 = subprocess.Popen([mpt_py, "main.py"], cwd=mpt_dir)
            processes.append(("Brainrot Render Engine (8080)", p4))

        p5 = subprocess.Popen(["npm", "run", "dev"], shell=True)
        processes.append(("Frontend Vite Server", p5))

        print("\nAll services started! Press Ctrl+C to terminate all services.\n")

        while True:
            time.sleep(1)
            for name, proc in processes:
                poll = proc.poll()
                if poll is not None:
                    print(f"Warning: {name} exited with code {poll}")

    except KeyboardInterrupt:
        print("\nShutting down all services...")
        for name, proc in processes:
            print(f"Stopping {name}...")
            proc.terminate()
        for name, proc in processes:
            try:
                proc.wait(timeout=3)
            except subprocess.TimeoutExpired:
                proc.kill()
        print("All services stopped.")

if __name__ == "__main__":
    main()

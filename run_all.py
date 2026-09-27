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

def main():
    print("=" * 65)
    print("  CREATOR AI STUDIO — FULL SYSTEM LAUNCHER")
    print("  1. Studio Backend:       http://localhost:8000 (API & Docs)")
    print("  2. Intelligence Backend: http://localhost:8001 (Profiling & Trends)")
    print("  3. Web / Mobile UI:      http://localhost:5174 & LAN accessible")
    print("=" * 65)
    print("Starting all 3 services...\n")

    processes = []
    try:
        p1 = subprocess.Popen([sys.executable, "backend/run_backend.py"])
        processes.append(("Studio Backend (8000)", p1))

        p2 = subprocess.Popen([sys.executable, "backend/intelligence/run.py"])
        processes.append(("Intelligence Backend (8001)", p2))

        p3 = subprocess.Popen(["npm", "run", "dev"], shell=True)
        processes.append(("Frontend Vite Server", p3))

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

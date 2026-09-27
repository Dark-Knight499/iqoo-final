import uvicorn
import os
import sys

# Ensure backend root is on python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("=" * 60)
    print("  CREATOR AI STUDIO — iQOO HACKATHON BACKEND SERVICE")
    print("  Hardware: Snapdragon 8 Elite NPU (45 TOPS Emulated)")
    print("  Host: http://127.0.0.1:8000")
    print("  API Docs: http://127.0.0.1:8000/docs")
    print("=" * 60)
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

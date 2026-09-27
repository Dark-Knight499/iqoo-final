from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import router

app = FastAPI(
    title="Creator AI Studio - iQOO On-Device & Office Kit Backend",
    description="Phone-First AI Video & 3D Creative Studio Backend for iQOO Hackathon",
    version="1.0.0"
)

# Enable CORS for React Native / Expo web and mobile
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

@app.get("/")
def root():
    return {
        "app": "Creator AI Studio Backend",
        "iQOO_NPU": "Active & Hardware Accelerated",
        "docs": "/docs"
    }

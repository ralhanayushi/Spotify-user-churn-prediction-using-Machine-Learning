from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.routes import predict, analytics
from app.database import ping_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: verify MongoDB is reachable
    await ping_db()
    yield
    # Shutdown (add cleanup here if needed)


app = FastAPI(
    title="Spotify Churn Prediction API",
    description="Predict user churn and store results in MongoDB",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # tighten to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict.router, prefix="/api", tags=["Prediction"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])


@app.get("/")
def root():
    return {"message": "Spotify Churn Prediction API is running 🎵"}
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "spotify_churn")

client = AsyncIOMotorClient(MONGO_URI)
db = client[DATABASE_NAME]

# Collections
predictions_collection = db["predictions"]


async def ping_db():
    """Check if MongoDB is reachable."""
    try:
        await client.admin.command("ping")
        print("✅ Connected to MongoDB successfully.")
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
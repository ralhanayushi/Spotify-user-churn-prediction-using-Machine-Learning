from fastapi import APIRouter, HTTPException
from app.schemas.user_schema import UserDataEntry
from app.database import get_db
from datetime import datetime

router = APIRouter()

@router.post("/submit")
async def submit_user_data(data: UserDataEntry):
    """
    User submits their real data including actual churn status.
    This data is stored in MongoDB and can be used to retrain the model.
    """
    try:
        db = get_db()
        record = data.model_dump()
        record["submitted_at"] = datetime.utcnow()
        record["used_for_training"] = False  # flag for retraining pipeline

        await db.user_data.insert_one(record)
        return {"message": "✅ Data saved successfully for future training"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/training-data")
async def get_training_data():
    """Export all stored user data as CSV-ready format for retraining"""
    try:
        db = get_db()
        cursor = db.user_data.find({}, {"_id": 0, "submitted_at": 0})
        records = await cursor.to_list(length=10000)
        return {
            "total_records": len(records),
            "data": records
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
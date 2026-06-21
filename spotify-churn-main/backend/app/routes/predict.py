from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone

from app.schemas.user_schema import UserInput
from app.services.model_service import predict_churn
from app.database import predictions_collection

router = APIRouter()


@router.post("/predict/")
async def predict(user_input: UserInput):
    """
    Accept user form data, run the ML model, save input + result to MongoDB,
    and return the prediction result.
    """
    try:
        # 1. Run the ML model
        result = predict_churn(user_input)

        # 2. Build the MongoDB document
        document = {
            # ── User input ──────────────────────────────
            "subscription_type":    user_input.subscription_type,
            "country":              user_input.country,
            "avg_daily_minutes":    user_input.avg_daily_minutes,
            "number_of_playlists":  user_input.number_of_playlists,
            "top_genre":            user_input.top_genre,
            "skips_per_day":        user_input.skips_per_day,
            "support_tickets":      user_input.support_tickets,
            "days_since_last_login": user_input.days_since_last_login,

            # ── Prediction result ────────────────────────
            "churn_probability":    result["churn_probability"],
            "churn_prediction":     result["churn_prediction"],
            "risk_level":           result["risk_level"],
            "top_risk_factors":     result["top_risk_factors"],
            "recommendation":       result["recommendation"],

            # ── Metadata ────────────────────────────────
            "created_at": datetime.now(timezone.utc),
        }

        # 3. Insert into MongoDB
        insert_result = await predictions_collection.insert_one(document)
        print(f"✅ Saved prediction to MongoDB with id: {insert_result.inserted_id}")

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction or DB error: {str(e)}")


@router.get("/predictions/")
async def get_all_predictions():
    """
    Return all stored predictions from MongoDB (newest first).
    """
    try:
        cursor = predictions_collection.find().sort("created_at", -1).limit(100)
        records = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])                    # make ObjectId JSON-serialisable
            doc["created_at"] = doc["created_at"].isoformat()
            records.append(doc)
        return {"total": len(records), "predictions": records}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB fetch error: {str(e)}")


@router.get("/predictions/stats/")
async def get_prediction_stats():
    """
    Return quick summary stats from stored predictions.
    """
    try:
        total = await predictions_collection.count_documents({})
        churned = await predictions_collection.count_documents({"churn_prediction": True})
        not_churned = total - churned

        churn_rate = round((churned / total * 100), 2) if total > 0 else 0

        return {
            "total_predictions": total,
            "churned_count": churned,
            "not_churned_count": not_churned,
            "churn_rate_percent": churn_rate,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stats error: {str(e)}")
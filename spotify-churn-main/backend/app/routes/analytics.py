from fastapi import APIRouter
import json, os

router = APIRouter()

BASE = os.path.join(os.path.dirname(__file__), '..', 'models')

@router.get("/summary")
def get_summary():
    with open(os.path.join(BASE, 'analytics.json')) as f:
        return json.load(f)

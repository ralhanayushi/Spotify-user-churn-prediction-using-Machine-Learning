from pydantic import BaseModel, Field
from typing import Literal


SUBSCRIPTION_TYPES = Literal["Premium", "Free"]
COUNTRIES = Literal["US", "IN", "UK", "DE", "CA", "AU", "FR", "BR", "JP", "MX"]
GENRES = Literal["Pop", "Rock", "Hip-Hop", "Jazz", "Classical", "Electronic", "R&B", "Country", "Metal", "Other"]


class UserInput(BaseModel):
    subscription_type: SUBSCRIPTION_TYPES = Field(..., example="Premium")
    country: COUNTRIES = Field(..., example="US")
    avg_daily_minutes: float = Field(..., ge=0, le=1440, example=90.0)
    number_of_playlists: int = Field(..., ge=0, example=5)
    top_genre: GENRES = Field(..., example="Pop")
    skips_per_day: int = Field(..., ge=0, example=4)
    support_tickets: int = Field(..., ge=0, example=0)
    days_since_last_login: int = Field(..., ge=0, example=3)

    class Config:
        json_schema_extra = {
            "example": {
                "subscription_type": "Premium",
                "country": "US",
                "avg_daily_minutes": 90,
                "number_of_playlists": 5,
                "top_genre": "Pop",
                "skips_per_day": 4,
                "support_tickets": 0,
                "days_since_last_login": 3,
            }
        }
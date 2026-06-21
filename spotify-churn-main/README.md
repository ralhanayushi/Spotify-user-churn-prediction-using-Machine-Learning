# 🎵 Spotify Customer Churn Prediction
The Spotify Customer Churn Prediction System is a full-stack machine learning application
designed to help Spotify's business teams identify users at risk of churning. The system ingests
user behavioral features — including listening habits, engagement patterns, and support activity
— and outputs a churn probability score, a risk classification, and actionable retention
recommendations.
The system is a new, standalone full-stack application developed as an academic project. It is not
a replacement for any existing Spotify internal tooling but rather a prototype demonstrating how
machine learning can be integrated into a production-style web system. 

# Technology Stack and Tools Used
🧠 Machine Learning
scikit-learn  - 1.5.1 , 
GradientBoostingClassifier , 
StandardScaler ,
LabelEncoder ,
pandas        -  2.2.2 ,
numpy         -  1.26.4 ,
joblib        -  1.4.2 ,

⚙️ Backend
Python        -  3.11 ,
FastAPI       -  0.115.0 ,
Uvicorn       -  0.30.6 , 
Pydantic      -  2.8.2 , 
python-multipart - 0.0.9 , 

🎨 Frontend
React         -  18.3.1 , 
Vite          -  5.3.4 , 
React Router DOM - 6.25.1 , 
Axios         -  1.7.2 , 
Recharts      -  2.12.7 , 

🗂️ Data
CSV file , 
JSON file , 
.pkl files , 

🛠️ Dev Tools
VS Code , 
Git , 
npm , 
pip , 
Python venv , 
Swagger UI , 

Full-stack ML app — FastAPI backend + React frontend — trained on real Spotify user data.


## Dataset Features Used
| Column | Type | Description |
|---|---|---|
| subscription_type | categorical | Premium / Free |
| country | categorical | 10 countries (US, IN, UK, DE, ...) |
| avg_daily_minutes | float | Average daily listening time |
| number_of_playlists | int | Playlists created |
| top_genre | categorical | Favourite genre |
| skips_per_day | int | Daily skip count |
| support_tickets | int | Complaints raised |
| days_since_last_login | int | Recency |
| **churned** | int (target) | 0 = stayed, 1 = churned |

## Model Performance
- **Algorithm:** Gradient Boosting Classifier
- **Accuracy:** 80%
- **ROC-AUC:** 0.75
- **Churn Rate in Dataset:** 18.6%
- **Top Features:** avg_daily_minutes, engagement_score, days_since_last_login

---

## 🚀 Steps to Run the Project

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Train the model (one-time)
python train_model.py

# Start the API
uvicorn app.main:app --reload --port 8000
```

API Docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173

---

## 📡 API Endpoints

### POST /api/predict/
```json
{
  "subscription_type": "Premium",
  "country": "US",
  "avg_daily_minutes": 90,
  "number_of_playlists": 5,
  "top_genre": "Pop",
  "skips_per_day": 4,
  "support_tickets": 0,
  "days_since_last_login": 3
}
```

Response:
```json
{
  "churn_probability": 0.12,
  "churn_prediction": false,
  "risk_level": "Low",
  "top_risk_factors": ["Avg Daily Minutes", "Engagement Score", "Days Since Last Login"],
  "recommendation": "✅ User is healthy: continue standard engagement."
}
```

### GET /api/analytics/summary
Returns pre-computed analytics: churn rates by genre, country, subscription, feature importances.

---

## 🗂 Project Structure

```
spotify-churn/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app
│   │   ├── models/              # Trained model files (.pkl, .json)
│   │   ├── routes/
│   │   │   ├── predict.py
│   │   │   └── analytics.py
│   │   ├── services/
│   │   │   └── model_service.py
│   │   └── schemas/
│   │       └── user_schema.py
│   ├── data/
│   │   └── spotify_churn_dataset.csv
│   ├── train_model.py
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Predict.jsx
    │   │   └── Analytics.jsx
    │   ├── services/
    │   │   └── api.js
    │   └── App.jsx
    ├── package.json
    └── vite.config.js
```
# Team Members
Bhumi Wadhwani - EN23CS301265                                                                                                
Ayushi Ralhan  - EN23CS301251 

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix
import joblib
import os
import json

# ── Load Data ──────────────────────────────────────────────
df = pd.read_csv('data/spotify_churn_dataset.csv')

# ── Clean: fix negative avg_daily_minutes ─────────────────
df['avg_daily_minutes'] = df['avg_daily_minutes'].clip(lower=0)

# ── Encode Categoricals ────────────────────────────────────
df['is_premium'] = (df['subscription_type'] == 'Premium').astype(int)

genre_encoder = LabelEncoder()
df['genre_encoded'] = genre_encoder.fit_transform(df['top_genre'])

country_encoder = LabelEncoder()
df['country_encoded'] = country_encoder.fit_transform(df['country'])

# ── Feature Engineering ────────────────────────────────────
df['engagement_score'] = df['avg_daily_minutes'] / (df['skips_per_day'] + 1)
df['risk_score'] = df['days_since_last_login'] * df['support_tickets'] + df['skips_per_day']

FEATURES = [
    'avg_daily_minutes',
    'number_of_playlists',
    'skips_per_day',
    'support_tickets',
    'days_since_last_login',
    'is_premium',
    'genre_encoded',
    'country_encoded',
    'engagement_score',
    'risk_score'
]
TARGET = 'churned'

X = df[FEATURES]
y = df[TARGET]

# ── Train/Test Split ───────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# ── Scale ──────────────────────────────────────────────────
scaler = StandardScaler()
X_train_sc = scaler.fit_transform(X_train)
X_test_sc  = scaler.transform(X_test)

# ── Train Model ────────────────────────────────────────────
model = GradientBoostingClassifier(
    n_estimators=300,
    learning_rate=0.05,
    max_depth=4,
    subsample=0.8,
    random_state=42
)
model.fit(X_train_sc, y_train)

# ── Evaluate ───────────────────────────────────────────────
y_pred  = model.predict(X_test_sc)
y_proba = model.predict_proba(X_test_sc)[:, 1]
auc     = roc_auc_score(y_test, y_proba)

print("\n📊 Classification Report:")
print(classification_report(y_test, y_pred))
print(f"🎯 ROC-AUC Score: {auc:.4f}")

# ── Feature Importance ─────────────────────────────────────
importances = model.feature_importances_
feat_imp = sorted(zip(FEATURES, importances), key=lambda x: -x[1])
print("\n🔍 Feature Importances:")
for f, imp in feat_imp:
    print(f"  {f}: {imp:.4f}")

# ── Dataset Analytics (pre-computed for frontend) ──────────
analytics = {
    "total_users": int(len(df)),
    "churned_users": int(df['churned'].sum()),
    "retained_users": int((df['churned'] == 0).sum()),
    "churn_rate": round(float(df['churned'].mean() * 100), 2),
    "avg_daily_minutes": round(float(df['avg_daily_minutes'].mean()), 2),
    "avg_playlists": round(float(df['number_of_playlists'].mean()), 2),
    "feature_importance": [{"feature": f, "importance": round(float(i), 4)} for f, i in feat_imp],
    "churn_by_subscription": df.groupby('subscription_type')['churned'].mean().round(4).to_dict(),
    "churn_by_genre": df.groupby('top_genre')['churned'].mean().round(4).to_dict(),
    "churn_by_country": df.groupby('country')['churned'].mean().round(4).to_dict(),
    "genre_counts": df['top_genre'].value_counts().to_dict(),
    "country_counts": df['country'].value_counts().to_dict(),
    "model_auc": round(auc, 4)
}

# ── Save everything ────────────────────────────────────────
os.makedirs('app/models', exist_ok=True)
joblib.dump(model,           'app/models/churn_model.pkl')
joblib.dump(scaler,          'app/models/scaler.pkl')
joblib.dump(genre_encoder,   'app/models/genre_encoder.pkl')
joblib.dump(country_encoder, 'app/models/country_encoder.pkl')
joblib.dump(FEATURES,        'app/models/features.pkl')

with open('app/models/analytics.json', 'w') as f:
    json.dump(analytics, f, indent=2)

print("\n✅ All model files saved to app/models/")

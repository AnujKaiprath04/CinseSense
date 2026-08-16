import requests

BASE_URL = "http://127.0.0.1:8008"

print("--- Testing Phase Endpoints ---")
# 1. Vibe Search
res1 = requests.post(f"{BASE_URL}/api/recommendations/vibe-search", json={"user_id": 1, "prompt": "Mind-bending sci-fi under 2 hours"})
print("Vibe Search status:", res1.status_code, res1.json().get("ai_reply"))

# 2. CineParty
res2 = requests.post(f"{BASE_URL}/api/recommendations/cineparty", json={"user_ids": [1, 2]})
print("CineParty status:", res2.status_code, "Compatibility:", res2.json().get("compatibility_score"))

# 3. Model Metrics & Retrain
res3 = requests.get(f"{BASE_URL}/api/admin/model-metrics")
print("Model Metrics status:", res3.status_code, "RMSE:", res3.json().get("rmse"))

res4 = requests.post(f"{BASE_URL}/api/admin/retrain")
print("Retrain status:", res4.status_code, res4.json().get("message"))

# 4. Notifications
res5 = requests.get(f"{BASE_URL}/api/notifications?user_id=1")
print("Notifications status:", res5.status_code, "Count:", len(res5.json()))

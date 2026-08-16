import requests

try:
    r_backend = requests.get("http://127.0.0.1:8008/health")
    print("Backend Status:", r_backend.status_code, r_backend.json())
except Exception as e:
    print("Backend Error:", e)

try:
    r_frontend = requests.get("http://localhost:3000")
    print("Frontend Status:", r_frontend.status_code, "HTML length:", len(r_frontend.text))
except Exception as e:
    print("Frontend Error:", e)

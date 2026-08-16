import sys
import time
import httpx

BASE_URL = "http://localhost:8008"

def run_smoke_tests():
    print("=" * 60)
    print("  CINESENSE BACKEND SMOKE TEST SUITE")
    print("=" * 60)

    start_time = time.time()
    passed = 0
    failed = 0

    def assert_test(name: str, condition: bool, details: str = ""):
        nonlocal passed, failed
        if condition:
            print(f"[PASS] {name} {f'({details})' if details else ''}")
            passed += 1
        else:
            print(f"[FAIL] {name} - {details}")
            failed += 1

    try:
        client = httpx.Client(base_url=BASE_URL, timeout=10.0)

        # 1. Health check
        res = client.get("/health")
        assert_test("Health Endpoint", res.status_code == 200 and res.json().get("status") == "healthy")

        # 2. Demo Users List
        res = client.get("/api/auth/users")
        users = res.json()
        assert_test("Demo Users Endpoint", res.status_code == 200 and len(users) >= 4, f"Found {len(users)} demo users")

        # 3. Recommendations for Warm User (User 1)
        res = client.get("/api/recommendations?user_id=1&limit=5")
        recs = res.json()
        has_warm_confidence = len(recs) > 0 and recs[0].get("confidence_level") in ["HIGH", "MEDIUM"]
        assert_test("Warm Recommendations (User 1)", res.status_code == 200 and has_warm_confidence, f"Served {len(recs)} recs with rationale")

        # 4. Recommendations for Fresh Cold-Start User
        cold_res = client.post("/api/auth/users", json={"username": f"ColdUser_{int(time.time())}", "email": f"cold_{int(time.time())}@cinesense.ai"})
        cold_user_id = cold_res.json()["id"]
        res = client.get(f"/api/recommendations?user_id={cold_user_id}&limit=5")
        cold_recs = res.json()
        is_exploratory = len(cold_recs) > 0 and cold_recs[0].get("confidence_level") == "LOW"
        assert_test("Cold-Start Fallback", res.status_code == 200 and is_exploratory, "Flagged low confidence / exploratory pick correctly")

        # 5. Watchlist Add & Get
        add_res = client.post("/api/watchlist", json={"user_id": 1, "movie_id": 15})
        get_res = client.get("/api/watchlist?user_id=1")
        w_items = get_res.json()
        assert_test("Watchlist Add & Retrieve", add_res.status_code == 201 and len(w_items) > 0)

        # 6. Watchlist Remove
        del_res = client.delete("/api/watchlist?user_id=1&movie_id=15")
        assert_test("Watchlist Remove", del_res.status_code == 204)

        # 7. Interaction Rating
        rate_res = client.post("/api/engagement/rate", json={"user_id": 4, "movie_id": 7, "rating": 5.0})
        assert_test("Movie Rating Flow", rate_res.status_code == 201)

        # 8. Responsible AI Audit Logs
        audit_res = client.get("/api/admin/audit-logs?limit=10")
        audit_data = audit_res.json()
        assert_test("Responsible AI Audit Trail", audit_res.status_code == 200 and len(audit_data.get("logs", [])) > 0, f"Found {audit_data.get('total')} logged agent actions")

        # 9. Admin Analytics
        analytics_res = client.get("/api/admin/analytics")
        analytics_data = analytics_res.json()
        assert_test("Analytics Dashboard Data", analytics_res.status_code == 200 and "click_through_rate" in analytics_data)

    except Exception as e:
        print(f"\n[ERROR] Smoke test suite encountered error: {e}")
        failed += 1

    duration = round(time.time() - start_time, 2)
    print("=" * 60)
    print(f"  RESULTS: {passed} PASSED, {failed} FAILED in {duration}s")
    print("=" * 60)

    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    run_smoke_tests()

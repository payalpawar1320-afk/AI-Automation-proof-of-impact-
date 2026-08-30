import urllib.request
import json
import time

BASE_URL = 'http://localhost:3000'

def test_endpoint(name, url, method='GET', data=None):
    print(f"\n--- Testing: {name} ({method} {url}) ---")
    headers = {'Content-Type': 'application/json'} if data else {}
    req_data = json.dumps(data).encode('utf-8') if data else None
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as resp:
            status = resp.status
            content = resp.read().decode('utf-8')
            print(f"Status: {status} OK")
            try:
                parsed = json.loads(content)
                print(f"Response Summary: {list(parsed.keys()) if isinstance(parsed, dict) else len(parsed)}")
                return parsed
            except:
                print(f"HTML Content length: {len(content)} bytes")
                return content
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.read().decode('utf-8')}")
        raise e

def run_e2e_suite():
    print("==================================================")
    print("  PROOF OF IMPACT (IMPACTLOOP AI) - E2E TEST SUITE")
    print("==================================================")

    # 1. Test Homepage
    home = test_endpoint("1. Frontend Home UI", f"{BASE_URL}/")
    assert "<!DOCTYPE html>" in home or "html" in home, "Home page failed to render HTML"

    # 2. Test Issues List
    issues_res = test_endpoint("2. Issues API (Campus Domain)", f"{BASE_URL}/api/issues?domain=campus")
    assert "issues" in issues_res and len(issues_res["issues"]) > 0, "Failed to retrieve campus issues"
    print(f"Retrieved {len(issues_res['issues'])} campus issues.")

    # 3. Test AI Triage & Duplicate Detection
    triage_req = {
        "title": "Wi-Fi not working in Computer Lab 3 during class",
        "description": "Laptops unable to connect to campus network in Lab 3.",
        "domain": "campus"
    }
    triage_res = test_endpoint("3. Real-Time AI Triage & Duplicate Check", f"{BASE_URL}/api/ai/triage", method='POST', data=triage_req)
    assert triage_res["category"] == "IT & Network", f"Unexpected category {triage_res['category']}"
    assert len(triage_res["potentialDuplicates"]) > 0, "Expected duplicate detection for Lab 3 Wi-Fi"
    print(f"AI Triage extracted Asset: '{triage_res['asset']}', Dept: '{triage_res['department']}', Duplicates Found: {len(triage_res['potentialDuplicates'])}")

    # 4. Test Reporting New Issue
    create_req = {
        "title": "Water Cooler filter leaking on 3rd floor corridor",
        "description": "Continuous puddle forming outside Room 305 creating slip hazard.",
        "domain": "campus",
        "beforeImageUrl": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
        "reportedBy": "Campus Safety Officer"
    }
    create_res = test_endpoint("4. Report New Issue & Trigger Intake Loop", f"{BASE_URL}/api/issues", method='POST', data=create_req)
    new_issue_id = create_res["issue"]["id"]
    assert new_issue_id, "Failed to create issue"
    print(f"Created Issue {new_issue_id} with AI Category '{create_res['issue']['category']}' and Priority '{create_res['issue']['priority']}'")

    # 5. Test Claiming Resolution
    claim_req = {
        "action": "CLAIM_RESOLUTION",
        "afterImageUrl": "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800&q=80",
        "afterNotes": "Replaced 5-micron filter cartridge and tightened brass shutoff valve. Floor dried.",
        "claimedBy": "Carlos Gomez (Plumber)"
    }
    claim_res = test_endpoint("5. Authority Resolution Claim", f"{BASE_URL}/api/issues/{new_issue_id}", method='PATCH', data=claim_req)
    assert claim_res["issue"]["status"] == "PENDING_VERIFICATION", "Issue status should be PENDING_VERIFICATION"
    print(f"Issue {new_issue_id} moved to status: {claim_res['issue']['status']}")

    # 6. Test AI Adjudication & Evidence Verification (The USP)
    verify_req = {
        "issueId": new_issue_id,
        "beforeNotes": create_req["description"],
        "afterNotes": claim_req["afterNotes"]
    }
    verify_res = test_endpoint("6. AI Evidence Adjudication & Verification", f"{BASE_URL}/api/ai/verify", method='POST', data=verify_req)
    assert verify_res["adjudication"]["status"] == "VERIFIED_SUCCESSFUL", "Expected verified adjudication"
    assert verify_res["issue"]["status"] == "VERIFIED_CLOSED", "Issue should be marked VERIFIED_CLOSED"
    print(f"AI Adjudication Result: {verify_res['adjudication']['status']} (Confidence: {verify_res['adjudication']['confidence']}%, Impact Delta: +{verify_res['adjudication']['impactScoreDelta']} pts)")

    # 7. Test AI Adjudication Failure / Fraudulent Sub-standard Claim Rejection
    civic_failed_req = {
        "issueId": "CIVIC-201",
        "beforeNotes": "Severe asphalt crater",
        "afterNotes": "Pothole filled with loose gravel and temporary patch."
    }
    verify_fail_res = test_endpoint("7. AI Adjudication Sub-standard Patch Rejection Test", f"{BASE_URL}/api/ai/verify", method='POST', data=civic_failed_req)
    assert verify_fail_res["adjudication"]["status"] == "VERIFICATION_FAILED_REOPENED", "Substandard gravel patch should be rejected"
    print(f"Sub-standard patch correctly rejected and escalated: {verify_fail_res['adjudication']['summary']}")

    # 8. Test Recurring Patterns
    patterns_res = test_endpoint("8. Recurring Problem Detector & Predictive Patterns", f"{BASE_URL}/api/ai/patterns?domain=campus")
    assert len(patterns_res["patterns"]) > 0, "Expected recurring patterns"
    print(f"Detected {len(patterns_res['patterns'])} Systemic Failure Clusters. Top cluster: '{patterns_res['patterns'][0]['title']}' with {patterns_res['patterns'][0]['frequencyCount']} occurrences.")

    # 9. Test Departmental Impact Scores
    depts_res = test_endpoint("9. Departmental Impact Scoring & True vs Claimed Metrics", f"{BASE_URL}/api/analytics/departments?domain=campus")
    assert len(depts_res["departments"]) > 0, "Expected department metrics"
    print(f"Top Department: '{depts_res['departments'][0]['department']}' with Impact Score: {depts_res['departments'][0]['impactScore']}/100 (Verified Rate: {depts_res['departments'][0]['verifiedResolutionRate']}%)")

    # 10. Test Generative Executive Query Assistant
    query_req = {
        "query": "What are the biggest infrastructure problems this month?",
        "domain": "campus"
    }
    query_res = test_endpoint("10. Generative Reporting & Executive Intelligence AI", f"{BASE_URL}/api/ai/query", method='POST', data=query_req)
    assert query_res["answer"], "Expected AI answer"
    print(f"AI Synthesis: {query_res['answer']}")
    print(f"Key Insights ({len(query_res['keyInsights'])}): {query_res['keyInsights'][0]}")

    print("\n==================================================")
    print("  [SUCCESS] ALL 10 END-TO-END VERIFICATION TESTS PASSED!")
    print("==================================================")

if __name__ == '__main__':
    run_e2e_suite()

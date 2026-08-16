import requests

res = requests.post("http://127.0.0.1:8008/api/recommendations/rag-assistant", json={
    "user_id": 1,
    "prompt": "Recommend Christopher Nolan movies with mind-bending plots"
})

print("RAG Status Code:", res.status_code)
data = res.json()
print("RAG AI Answer:\n", data.get("ai_answer"))
print("\nRetrieved RAG Documents:", len(data.get("retrieved_documents", [])))
for doc in data.get("retrieved_documents", []):
    print(f"- {doc['movie_title']} (Similarity: {doc['similarity_pct']})")

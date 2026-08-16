# 🤖 AI Usage Disclosure — CineSense

This document outlines the usage of Artificial Intelligence (AI) models and code generation tools during the development of **CineSense**.

---

## 1. Runtime AI Components (In-App Agent Architecture)

- **Explainer Agent LLM (`services/explainer.py`)**:
  - Model: Anthropic Claude API (`claude-3-haiku-20240307`).
  - Purpose: Generates natural language 1-2 sentence rationales for movie recommendations.
  - Guardrails: Strictly constrained prompt forbidding hallucinated watch history; automated fallback rules when confidence is `LOW` or API keys are missing.

---

## 2. AI-Assisted Development & Code Generation

- **Full-Stack Scaffolding & Architecture Design**:
  - Assisted by Antigravity AI agent.
  - Used to generate FastAPI schemas, SQLAlchemy models, React components, Tailwind styling, and test scripts.
- **Dataset Preprocessing & Synthetic User Generation**:
  - Automated seeding logic (`scripts/seed_db.py`) generated to simulate warm (heavy history), medium, and cold-start user profiles.

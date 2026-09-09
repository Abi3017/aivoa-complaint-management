# AIVOA Complaint Management System

AI-powered Customer Complaint Management System for pharmaceutical manufacturing (API/FDF QMS),
built for the AIVOA.AI Round 1 AI Product Engineer assignment.

The **Log Customer Complaint** form (left) is never edited by hand. It is filled and updated
entirely by the **AIVOA Co-Pilot** (right) — a LangGraph agent running on Groq — via three
mandatory tools:

1. **Log complaint tool** — free-text prompt → new complaint, form + risk assessment populated.
2. **Edit complaint tool** — free-text prompt → updates specific fields on the open complaint,
   preserving everything else.
3. **Document extraction tool** — upload a PDF/DOCX/TXT/EML complaint → same extraction +
   risk assessment, and still editable afterward via natural language.

Bonus AI features implemented: root cause recommendation, CAPA recommendation, complaint
summary, risk classification, completeness check, and duplicate complaint detection.

See `ARCHITECTURE.md` for how the LangGraph agent is wired and why, and
`SUBMISSION_CHECKLIST.md` for a day-of checklist against the assignment's deliverables.

## Tech stack (as mandated by the assignment)

- Frontend: React + Redux Toolkit (Vite)
- Backend: Python + FastAPI
- AI agent framework: LangGraph
- LLM: Groq, `gemma2-9b-it` (primary), `llama-3.3-70b-versatile` (fallback if JSON parsing fails)
- Database: SQLAlchemy — SQLite by default (zero setup), swap to Postgres/MySQL via `DATABASE_URL`
- Font: Google Inter

## Running it

### 1. Backend

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# edit .env and paste your GROQ_API_KEY (free key: https://console.groq.com/keys)
uvicorn app.main:app --reload --port 8000
```

Backend runs at http://localhost:8000 (interactive API docs at `/docs`).

Optional — regenerate the two sample complaint files used for the document-extraction demo:

```bash
python sample_data/generate_samples.py
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # defaults to http://localhost:8000, fine for local dev
npm run dev
```

Frontend runs at http://localhost:3000.

### 3. Try it

- Type: `Apollo Pharmacy reported discolored capsules in amoxicillin capsules 500 mg.`
  → new complaint created, form + risk assessment populate.
- Follow up: `the batch number is AMX24602 and the affected quantity is 48 capsules`
  → same complaint updates in place.
- Upload `backend/sample_data/sample_complaint_metformin_api.txt` or
  `sample_complaint_amoxicillin.pdf` → document extraction tool.
- After extraction, type another correction (e.g. a new batch number) → edit tool runs again
  on top of the extracted data.

## Project layout

```
backend/
  app/
    main.py                FastAPI app + CORS
    config.py               env-driven settings (model names, DB url, API key)
    database.py, models.py  SQLAlchemy setup + Complaint table
    schemas.py               Pydantic request/response models
    llm/client.py            Groq wrapper (primary model, fallback on bad JSON)
    llm/prompts.py           the three system prompts (extract/update, risk, chat reply)
    agent/state.py           LangGraph state shape
    agent/graph.py           the LangGraph agent itself (see ARCHITECTURE.md)
    routers/copilot.py       POST /api/copilot/message — the one endpoint all 3 tools call
    routers/complaints.py    GET/DELETE complaints (for a history/list view if you add one)
    utils/document_parser.py PDF/DOCX/TXT/EML -> plain text
  sample_data/               generator script + the two sample complaint files
frontend/
  src/
    App.jsx                  two-panel layout (form left, copilot right)
    components/               LogComplaintForm, AICopilotPanel, RiskAssessmentCard, ChatMessage
    store/                    Redux Toolkit slices: complaint (form+risk), chat (messages)
    api/copilotApi.js         calls the backend
```

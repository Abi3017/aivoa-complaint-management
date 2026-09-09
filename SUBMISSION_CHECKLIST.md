# Submission Checklist

Assignment deliverables, mapped to what's already done vs. what you still need to do yourself.

## Already built (this repo)

- [x] React + Redux frontend, two-panel layout matching the reference UI
- [x] FastAPI backend
- [x] LangGraph agent with 5 nodes (see ARCHITECTURE.md)
- [x] Groq integration (`gemma2-9b-it` primary, `llama-3.3-70b-versatile` fallback)
- [x] SQLite DB (swap to Postgres/MySQL by changing one env var)
- [x] Log complaint tool, edit complaint tool, document extraction tool — all three, one endpoint
- [x] Bonus: root cause recommendation, CAPA recommendation, complaint summary, risk
      classification, completeness check, duplicate detection
- [x] Two sample complaint files for the document-extraction demo (`backend/sample_data/`)
- [x] Backend verified: imports cleanly, graph compiles, full request cycle tested with a mocked
      LLM (document upload → extraction → risk assessment → duplicate check → chat reply → DB)
- [x] Frontend verified: `npm run build` succeeds with no errors

## You still need to do

- [ ] Get a free Groq API key at https://console.groq.com/keys, put it in `backend/.env`
- [ ] Run both servers locally and click through the flow yourself once (see README "Try it")
      — confirm the real model's JSON comes back clean; if `gemma2-9b-it` misbehaves on your
      test prompts, the fallback to `llama-3.3-70b-versatile` should kick in automatically, but
      watch the backend logs (`logger.warning`) to see if it's happening a lot
- [ ] Push this to a **public** (or shared-with-them) GitHub repo
- [ ] Record demo video 1 (5-10 min): working demonstration of all 3 tools + bonus features,
      live in the browser
- [ ] Record demo video 2 (5-10 min): code walkthrough — frontend → API call → FastAPI endpoint
      → LangGraph agent → how the response lands back in the form + risk panel. `ARCHITECTURE.md`
      is written to be read from, almost verbatim, for this video.
- [ ] Submit via the Google Form: https://forms.gle/JhB65RNgszHyBrBm7
      (GitHub repo link + both video links)

## If something breaks under time pressure

- **Groq rate limits / key not working**: double check the key was copied without a trailing
  space, and that `backend/.env` (not just `.env.example`) has it.
- **CORS errors in the browser console**: confirm `frontend/.env`'s `VITE_API_BASE_URL` matches
  where uvicorn is actually running, and `backend/.env`'s `CORS_ORIGINS` includes the frontend's
  origin (defaults already match for local dev on ports 3000/8000).
- **Model returns bad JSON repeatedly**: temporarily set `GROQ_PRIMARY_MODEL` in `.env` to
  `llama-3.3-70b-versatile` to unblock your demo recording, then switch back and mention in the
  interview that you saw this and built the fallback for exactly that reason — that's a good
  story, not a thing to hide.
- **Running out of time for a bonus feature**: all 6 bonus fields already come back from one
  `assess_risk` LLM call — you don't need to build anything extra to show them, just make sure
  `RiskAssessmentCard.jsx` is visible in your demo recording.

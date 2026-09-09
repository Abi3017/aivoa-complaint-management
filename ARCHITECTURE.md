# Architecture & Design Reasoning

This is the doc to lean on for the "explain your implementation / code walkthrough" part of
the demo video and the interview. It explains *why* things are built this way, not just what
the code does.

## The core design decision: one graph, three "tools"

The demo video describes three separate AI tools (log complaint, edit complaint, document
extraction). It would be tempting to build three separate LLM call paths for them. Instead,
all three run through **one LangGraph agent** (`backend/app/agent/graph.py`), invoked from
**one endpoint** (`POST /api/copilot/message`).

Why: all three tools do the same underlying job — take some new information (typed text, or
text extracted from a document) and merge it into a complaint form that may already be
partially filled, then re-assess risk. The only thing that differs between "log" and "edit" is
whether `current_form` starts empty or already has data — and the only thing that differs for
"document extraction" is that the raw text comes from a parsed file instead of the chat box.
Modeling that as one graph with a conditional entry point is both less code and a more honest
representation of what's actually happening: from the model's point of view, an edit is just
"a new complaint update input, applied on top of existing form data."

## Root cause of the workflow shown in the video

Looking at the demo closely: every AI action in the UI is really just **one conversational
turn** against a stateful complaint record — you give the copilot text or a document, it
updates two panels (the form, and the risk assessment), and it replies in the chat. That's the
"root cause" of the architecture: the product isn't three tools, it's one turn-based agent with
persistent state per complaint (`complaint_id`), which is why the DB row (`Complaint.form_data`,
`Complaint.risk_assessment`) is the single source of truth the frontend just mirrors into Redux.

## The graph itself

```
START
  |
  +-- (input_type == "document") --> parse_document --+
  |                                                    |
  +-- (input_type == "text") --------------------------+
                                                        v
                                              extract_or_update
                                                        |
                                                        v
                                                  assess_risk
                                                        |
                                                        v
                                               check_duplicates
                                                        |
                                                        v
                                                    respond
                                                        |
                                                        v
                                                      END
```

- **parse_document** — a no-op placeholder node today (text extraction already happened in the
  router via `utils/document_parser.py`, using `pypdf`/`python-docx`/stdlib `email`, since the
  assignment explicitly says production-grade OCR isn't required). It exists as its own graph
  node so the pipeline is explicit and so a real OCR step could slot in later without touching
  the rest of the graph.
- **extract_or_update** — one Groq call (JSON mode) that receives `CURRENT_FORM` + `NEW_INPUT`
  and returns a merged `updated_form`. The prompt explicitly instructs the model to preserve
  every field it isn't given new information for — this is what makes "the batch number is
  BMX24602 and the affected quantity is 48 capsules" work as an edit instead of wiping the rest
  of the form.
- **assess_risk** — a second Groq call that reasons over the *complete* updated form to produce
  severity, priority, next action, and the bonus fields (root cause hypothesis, CAPA
  recommendation, summary, risk classification, completeness check). Kept as a separate call
  from extraction so the model isn't asked to do two different kinds of reasoning (data
  extraction vs. QA judgment) in one pass — in testing, that split produced much more reliable
  JSON out of the small `gemma2-9b-it` model.
- **check_duplicates** — deliberately *not* an LLM call. It's a simple rule-based check (same
  product name + batch/lot number already exists on another complaint in the DB) because
  duplicate detection needs to be exact and deterministic, not "creative."
- **respond** — a final Groq call that turns the structured result into the short natural-
  language reply shown in the chat panel.

## Why gemma2-9b-it + llama-3.3-70b-versatile

The assignment mandates `gemma2-9b-it`. It's fast and cheap but, being a 9B model, occasionally
returns JSON that doesn't quite parse on more complex extraction prompts. `llm/client.py`
(`call_json`) tries the primary model first and falls back once to `llama-3.3-70b-versatile`
only if the primary model's response fails `json.loads` — the assignment itself says to
"consider llama-3.3-70b-versatile for context," and this is that, made into an actual
reliability mechanism instead of a manual swap.

## Why the DB stores JSON blobs instead of exploded columns

`Complaint.form_data` and `Complaint.risk_assessment` are JSON columns, not one column per
field. The extraction schema (`schemas.py`) was still being refined during this build, and a
JSON blob means adding/renaming a field is a one-line change in `schemas.py` and the prompt —
no migration. For a real production QMS this would move to explicit columns (and probably a
proper audit trail of every edit, which QMS systems require), but for a 1-day technical
challenge this tradeoff is the right one and is worth being able to explain, not hide.

## What's intentionally out of scope

- Authentication/authorization — not mentioned in the assignment.
- A full audit trail of every edit (a real QMS complaint record needs one; noted above as the
  first thing to add post-challenge).
- Production-grade OCR — explicitly waived by the assignment.
- Streaming responses — turns are fast enough on Groq that request/response is simpler and more
  demoable than adding SSE/websockets under a 1-day deadline.

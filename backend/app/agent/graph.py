"""
The LangGraph agent behind all three mandatory AI tools (log complaint, edit
complaint, document extraction) plus two bonus features (duplicate detection,
completeness/root-cause reasoning happens inside assess_risk).

All three "tools" from the demo video are really the SAME graph called with
different inputs:
  - Log complaint tool   -> input_type="text",     current_form={}
  - Edit complaint tool  -> input_type="text",     current_form=<existing form>
  - Document extraction  -> input_type="document", current_form={} (or existing,
                             if you re-upload a follow-up doc on an open complaint)

Graph shape:

    START
      |
      v
  parse_document  (skipped for plain text input via conditional edge)
      |
      v
  extract_or_update   -- LLM: merges raw_text into current_form
      |
      v
  assess_risk         -- LLM: severity/priority/root-cause/CAPA/summary/completeness
      |
      v
  check_duplicates    -- rule-based: same product+batch already logged?
      |
      v
  respond              -- LLM: short natural-language chat reply
      |
      v
     END
"""
from langgraph.graph import END, StateGraph

from app.agent.state import AgentState
from app.llm.client import call_json
from app.llm.prompts import (
    CHAT_REPLY_SYSTEM,
    EXTRACT_OR_UPDATE_SYSTEM,
    RISK_ASSESSMENT_SYSTEM,
)


def parse_document_node(state: AgentState) -> AgentState:
    # Text extraction itself already happened in the router (utils/document_parser.py)
    # before the graph runs -- this node exists so the graph makes the step explicit
    # and so a future OCR/parsing step has a clear place to live.
    return state


def extract_or_update_node(state: AgentState) -> AgentState:
    user_prompt = (
        f"CURRENT_FORM:\n{state.get('current_form') or {}}\n\n"
        f"NEW_INPUT:\n{state['raw_text']}"
    )
    result = call_json(EXTRACT_OR_UPDATE_SYSTEM, user_prompt)
    state["updated_form"] = result.get("updated_form", state.get("current_form", {}))
    return state


def assess_risk_node(state: AgentState) -> AgentState:
    result = call_json(RISK_ASSESSMENT_SYSTEM, f"COMPLAINT_FORM:\n{state['updated_form']}")
    state["risk_assessment"] = result.get("risk_assessment", {})
    return state


def check_duplicates_node(state: AgentState) -> AgentState:
    form = state.get("updated_form", {})
    product = (form.get("product_name") or "").strip().lower()
    batch = (form.get("batch_lot_number") or "").strip().lower()

    duplicate = False
    note = None
    if product and batch:
        for other in state.get("existing_complaints", []):
            other_product = (other.get("product_name") or "").strip().lower()
            other_batch = (other.get("batch_lot_number") or "").strip().lower()
            if other_product == product and other_batch == batch:
                duplicate = True
                note = (
                    f"Another open complaint already references {form.get('product_name')} "
                    f"batch {form.get('batch_lot_number')}."
                )
                break

    state.setdefault("risk_assessment", {})
    state["risk_assessment"]["duplicate_flag"] = duplicate
    state["risk_assessment"]["duplicate_note"] = note
    return state


def respond_node(state: AgentState) -> AgentState:
    user_prompt = (
        f"UPDATED_FORM:\n{state.get('updated_form')}\n\n"
        f"RISK_ASSESSMENT:\n{state.get('risk_assessment')}"
    )
    # Chat reply is plain text, not JSON, so call the client directly.
    from app.llm.client import get_client
    from app.config import settings

    completion = get_client().chat.completions.create(
        model=settings.groq_primary_model,
        temperature=0.4,
        messages=[
            {"role": "system", "content": CHAT_REPLY_SYSTEM},
            {"role": "user", "content": user_prompt},
        ],
    )
    state["ai_reply"] = completion.choices[0].message.content.strip()
    return state


def route_after_start(state: AgentState) -> str:
    return "parse_document" if state.get("input_type") == "document" else "extract_or_update"


def build_graph():
    graph = StateGraph(AgentState)

    graph.add_node("parse_document", parse_document_node)
    graph.add_node("extract_or_update", extract_or_update_node)
    graph.add_node("assess_risk", assess_risk_node)
    graph.add_node("check_duplicates", check_duplicates_node)
    graph.add_node("respond", respond_node)

    graph.set_conditional_entry_point(
        route_after_start,
        {"parse_document": "parse_document", "extract_or_update": "extract_or_update"},
    )

    graph.add_edge("parse_document", "extract_or_update")
    graph.add_edge("extract_or_update", "assess_risk")
    graph.add_edge("assess_risk", "check_duplicates")
    graph.add_edge("check_duplicates", "respond")
    graph.add_edge("respond", END)

    return graph.compile()


_compiled_graph = None


def get_agent():
    global _compiled_graph
    if _compiled_graph is None:
        _compiled_graph = build_graph()
    return _compiled_graph

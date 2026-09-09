from typing import Optional, TypedDict


class AgentState(TypedDict, total=False):
    # --- inputs ---
    input_type: str  # "text" | "document"
    raw_text: str  # user prompt, OR text pulled from the uploaded file
    current_form: dict  # existing form_data for this complaint (empty dict if new)
    existing_complaints: list[dict]  # other complaints' form_data, for duplicate check

    # --- working state, filled in by nodes ---
    updated_form: dict
    risk_assessment: dict
    ai_reply: str
    error: Optional[str]

from typing import Optional

from pydantic import BaseModel, Field


class ComplaintForm(BaseModel):
    """Mirrors the 'Log Customer Complaint' form fields in the reference UI."""

    complaint_source: Optional[str] = None
    customer_name: Optional[str] = None

    product_name: Optional[str] = None
    product_strength_grade: Optional[str] = None
    batch_lot_number: Optional[str] = None
    manufacturing_date: Optional[str] = None
    expiry_date: Optional[str] = None
    quantity_affected: Optional[str] = None

    complaint_type: Optional[str] = None
    complaint_date: Optional[str] = None
    complaint_description: Optional[str] = None


class RiskAssessment(BaseModel):
    """Mirrors the 'AI Copilot Risk Assessment' panel, plus the bonus AI features."""

    initial_severity: Optional[str] = None  # Minor | Major | Critical
    priority: Optional[str] = None  # Low | Medium | High | Urgent
    recommended_next_action: Optional[str] = None

    # Bonus features from the assignment
    root_cause_recommendation: Optional[str] = None
    capa_recommendation: Optional[str] = None
    complaint_summary: Optional[str] = None
    risk_classification: Optional[str] = None
    completeness_check: list[str] = Field(
        default_factory=list, description="Fields still missing/unclear, if any"
    )
    duplicate_flag: bool = False
    duplicate_note: Optional[str] = None


class CopilotTurnRequest(BaseModel):
    message: Optional[str] = None
    complaint_id: Optional[int] = None  # None => start a new complaint


class CopilotTurnResponse(BaseModel):
    complaint_id: int
    form: ComplaintForm
    risk_assessment: RiskAssessment
    ai_reply: str


class ComplaintOut(BaseModel):
    id: int
    status: str
    form_data: dict
    risk_assessment: dict

    class Config:
        from_attributes = True

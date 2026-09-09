"""
The single endpoint behind all three mandatory AI tools from the demo video:
log complaint, edit complaint, and document extraction. The frontend's AI
Copilot panel calls this one endpoint every turn; whether it's a "new
complaint", an "edit", or a "document upload" is just a function of what
complaint_id and file are attached to the request -- the graph itself doesn't
care which button the user clicked.
"""
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.agent.graph import get_agent
from app.database import get_db
from app.models import Complaint
from app.schemas import ComplaintForm, CopilotTurnResponse, RiskAssessment
from app.utils.document_parser import extract_text

router = APIRouter(prefix="/api/copilot", tags=["copilot"])


@router.post("/message", response_model=CopilotTurnResponse)
async def copilot_turn(
    message: str | None = Form(default=None),
    complaint_id: int | None = Form(default=None),
    file: UploadFile | None = File(default=None),
    db: Session = Depends(get_db),
):
    if not message and not file:
        raise HTTPException(400, "Provide a message or a file.")

    # Load or create the complaint this turn applies to.
    complaint = db.get(Complaint, complaint_id) if complaint_id else None
    if complaint_id and complaint is None:
        raise HTTPException(404, "complaint_id not found")
    if complaint is None:
        complaint = Complaint(form_data={}, risk_assessment={}, status="Pending Triage")
        db.add(complaint)
        db.flush()  # get an id without committing yet

    if file is not None:
        raw_text = await extract_text(file)
        input_type = "document"
        complaint.source_type = "document"
    else:
        raw_text = message
        input_type = "text"

    others = (
        db.query(Complaint)
        .filter(Complaint.id != complaint.id)
        .all()
    )

    agent = get_agent()
    result = agent.invoke(
        {
            "input_type": input_type,
            "raw_text": raw_text,
            "current_form": complaint.form_data or {},
            "existing_complaints": [c.form_data or {} for c in others],
        }
    )

    complaint.form_data = result.get("updated_form", complaint.form_data)
    complaint.risk_assessment = result.get("risk_assessment", complaint.risk_assessment)
    complaint.raw_input_text = (complaint.raw_input_text or "") + f"\n---\n{raw_text}"

    severity = (complaint.risk_assessment or {}).get("initial_severity")
    if severity:
        complaint.status = f"Triaged - {severity}"

    db.commit()
    db.refresh(complaint)

    return CopilotTurnResponse(
        complaint_id=complaint.id,
        form=ComplaintForm(**(complaint.form_data or {})),
        risk_assessment=RiskAssessment(**(complaint.risk_assessment or {})),
        ai_reply=result.get("ai_reply", "Done."),
    )

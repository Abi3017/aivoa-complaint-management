from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, JSON, String

from app.database import Base


class Complaint(Base):
    """
    One row per complaint. `form_data` and `risk_assessment` are stored as JSON
    blobs rather than exploded into columns -- the schema the AI extracts is
    still evolving during the challenge, and JSON keeps the DB layer stable
    while the extraction schema in schemas.py changes.
    """

    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    status = Column(String(32), default="Pending Triage")

    form_data = Column(JSON, default=dict)
    risk_assessment = Column(JSON, default=dict)

    source_type = Column(String(32), default="prompt")  # prompt | document
    raw_input_text = Column(String(8000), default="")

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

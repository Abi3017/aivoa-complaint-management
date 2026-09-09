"""
Text extraction for the 'document extraction tool'. The assignment explicitly
says production-grade OCR/parsing is NOT required -- this only needs to turn
PDF / DOCX / TXT / EML into plain text so the LLM can do the real work.
"""
import email
from email import policy
from io import BytesIO

from fastapi import UploadFile
from pypdf import PdfReader
from docx import Document


async def extract_text(file: UploadFile) -> str:
    raw = await file.read()
    filename = (file.filename or "").lower()

    if filename.endswith(".pdf"):
        return _extract_pdf(raw)
    if filename.endswith(".docx"):
        return _extract_docx(raw)
    if filename.endswith(".eml"):
        return _extract_eml(raw)
    # .txt and anything else: best-effort decode
    return raw.decode("utf-8", errors="ignore")


def _extract_pdf(raw: bytes) -> str:
    reader = PdfReader(BytesIO(raw))
    return "\n".join(page.extract_text() or "" for page in reader.pages)


def _extract_docx(raw: bytes) -> str:
    doc = Document(BytesIO(raw))
    return "\n".join(p.text for p in doc.paragraphs)


def _extract_eml(raw: bytes) -> str:
    msg = email.message_from_bytes(raw, policy=policy.default)
    parts = [f"Subject: {msg.get('subject', '')}", f"From: {msg.get('from', '')}"]
    body = msg.get_body(preferencelist=("plain", "html"))
    if body:
        parts.append(body.get_content())
    return "\n".join(parts)

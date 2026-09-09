"""
Generates the two sample complaint files used to demo the document-extraction
tool. Run once: `python sample_data/generate_samples.py`
The assignment explicitly allows creating your own realistic sample
PDFs/emails, and re-uses the exact product names given as examples in the
reference video (Amoxicillin capsules, Metformin HCl API) so the demo lines
up with what the interviewer already watched.
"""
from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas

OUT_DIR = Path(__file__).parent


def make_pdf():
    path = OUT_DIR / "sample_complaint_amoxicillin.pdf"
    c = canvas.Canvas(str(path), pagesize=A4)
    width, height = A4
    y = height - 30 * mm

    def line(text, size=10, bold=False, gap=7 * mm):
        nonlocal y
        c.setFont("Helvetica-Bold" if bold else "Helvetica", size)
        c.drawString(25 * mm, y, text)
        y -= gap

    line("APOLLO PHARMACY - PRODUCT QUALITY COMPLAINT", 13, bold=True, gap=10 * mm)
    line("Complaint Reference: APC-2026-07-0142", 10)
    line("Date Received: 12-Jul-2026", 10, gap=10 * mm)

    line("Customer / Reporting Pharmacy: Apollo Pharmacy, Anna Nagar, Chennai", 10)
    line("Contact Person: R. Meenakshi, Store Pharmacist", 10, gap=10 * mm)

    line("PRODUCT DETAILS", 11, bold=True)
    line("Product Name: Amoxicillin Capsules", 10)
    line("Strength: 500 mg", 10)
    line("Batch / Lot Number: AMX24602", 10)
    line("Manufacturing Date: 03-Jan-2026", 10)
    line("Expiry Date: 02-Jan-2028", 10)
    line("Quantity Affected: 48 capsules (from 2 strips of a 60-capsule retail carton)", 10, gap=10 * mm)

    line("COMPLAINT DESCRIPTION", 11, bold=True)
    text_lines = [
        "On dispensing, the pharmacist observed that capsules from the affected strips",
        "showed visible discoloration (yellow-brown mottling) on the capsule shell compared",
        "to the reference/control sample retained in-store. No unusual odor was noted. The",
        "capsules were not dispensed to any patient and were quarantined immediately on",
        "discovery. The pharmacy is requesting root cause investigation and replacement",
        "stock for the affected batch.",
    ]
    for t in text_lines:
        line(t, 10, gap=6 * mm)

    c.showPage()
    c.save()
    print(f"Wrote {path}")


def make_email():
    path = OUT_DIR / "sample_complaint_metformin_api.txt"
    content = """From: qa.intake@meridianapi-distributors.com
To: complaints@genericfdf-manufacturing.com
Subject: Customer Complaint - Metformin HCl API - Batch MFH260712A

Dear QA Team,

We are writing to formally log a quality complaint regarding a recent shipment
of Metformin Hydrochloride API received from your facility.

Product Name: Metformin Hydrochloride API
Product Strength/Grade: IP/BP
Batch/Lot Number: MFH260712A
Manufacturing Date: 14-Jun-2026
Expiry Date: 13-Jun-2028
Quantity Affected: 25 kg (1 HDPE drum, out of a 5-drum consignment)

Complaint Details:
During incoming QC testing at our facility, the assay result for the above
batch was found to be marginally below the accepted specification range on
the first test (98.1% against NLT 98.5%). A retest is scheduled, but given
the deviation we are raising this as a formal complaint pending investigation.
The affected drum has been quarantined and segregated from approved stock.

We request your QA team to investigate potential root cause (e.g. process
deviation, storage/transport condition, testing methodology variance) and
advise on CAPA. Please also confirm whether other batches from the same
manufacturing campaign are affected.

Regards,
QA Intake Team
Meridian API Distributors
"""
    path.write_text(content, encoding="utf-8")
    print(f"Wrote {path}")


if __name__ == "__main__":
    make_pdf()
    make_email()

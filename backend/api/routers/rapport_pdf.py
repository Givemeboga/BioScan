from io import BytesIO

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from sqlalchemy.orm import Session

from database import get_db
from models.bilan_biologique import BilanBiologique
from models.rapport_anomalie import RapportAnomalie

router = APIRouter(
    prefix="/rapport-pdf",
    tags=["rapport-pdf"],
)


@router.get("/bilan/{bilan_id}")
def generate_bilan_pdf(
    bilan_id: int,
    db: Session = Depends(get_db),
):
    bilan = db.query(BilanBiologique).filter(BilanBiologique.bilan_id == bilan_id).first()
    if not bilan:
        raise HTTPException(status_code=404, detail="Bilan introuvable")

    anomalies = db.query(RapportAnomalie).filter(RapportAnomalie.bilan_id == bilan_id).all()

    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    y = height - 50

    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawString(50, y, f"Rapport PDF du bilan #{bilan_id}")
    y -= 30

    pdf.setFont("Helvetica", 11)
    lines = [
        f"Statut: {bilan.statut}",
        f"Type: {bilan.type}",
        f"Fichier: {bilan.nom_fichier or 'N/A'}",
        f"Patient ID: {bilan.patient_id or 'N/A'}",
        f"Technicien ID: {bilan.technicien_id or 'N/A'}",
        f"Medecin ID: {bilan.medecin_id or 'N/A'}",
    ]

    for line in lines:
        pdf.drawString(50, y, line)
        y -= 18

    y -= 10
    pdf.setFont("Helvetica-Bold", 13)
    pdf.drawString(50, y, "Anomalies")
    y -= 22
    pdf.setFont("Helvetica", 11)

    if anomalies:
        for anomaly in anomalies:
            pdf.drawString(
                50,
                y,
                f"- {anomaly.version or 'N/A'} | {anomaly.statut or 'N/A'} | {anomaly.type_anomalie or 'N/A'}",
            )
            y -= 16
            if y < 60:
                pdf.showPage()
                y = height - 50
                pdf.setFont("Helvetica", 11)
    else:
        pdf.drawString(50, y, "Aucune anomalie enregistrée")

    pdf.save()
    buffer.seek(0)

    headers = {"Content-Disposition": f'attachment; filename="rapport_bilan_{bilan_id}.pdf"'}
    return StreamingResponse(buffer, media_type="application/pdf", headers=headers)
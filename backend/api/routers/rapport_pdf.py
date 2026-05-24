import logging
import tempfile
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy import text
from sqlalchemy.orm import Session

from database import get_db
from utils.security import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/rapports-medicaux", tags=["Rapport PDF"])

BASE_DIR = Path(__file__).resolve().parents[2]
PDF_DIR = BASE_DIR / "media" / "reports"


def _get_patient_id(db: Session, user_id: int) -> Optional[int]:
    row = db.execute(
        text("SELECT patient_id FROM bioscan.patient WHERE utilisateur_id = :user_id"),
        {"user_id": user_id},
    ).mappings().first()
    return int(row["patient_id"]) if row else None


@router.post("/{rapport_id}/generate-pdf")
def generate_pdf_report(
    rapport_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import cm
        from reportlab.platypus import SimpleDocTemplate, Spacer, Paragraph, Table, TableStyle
    except Exception as exc:
        logger.error("ReportLab unavailable: %s", exc)
        raise HTTPException(status_code=500, detail="Dépendance reportlab indisponible") from exc

    report = db.execute(
        text(
            """
            SELECT
                rm.rapport_medical_id,
                rm.statut,
                rm.date_generation,
                rm.date_validation,
                rm.bilan_id,
                rm.patient_id,
                rm.medecin_id,
                pu.nom_utilisateur AS patient_nom,
                pu.email AS patient_email,
                pu.telephone AS patient_telephone,
                mu.nom_utilisateur AS medecin_nom,
                mu.email AS medecin_email
            FROM bioscan.rapport_medical rm
            LEFT JOIN bioscan.patient p ON p.patient_id = rm.patient_id
            LEFT JOIN bioscan.utilisateur pu ON pu.utilisateur_id = p.utilisateur_id
            LEFT JOIN bioscan.medecin_biologiste m ON m.medecin_id = rm.medecin_id
            LEFT JOIN bioscan.utilisateur mu ON mu.utilisateur_id = m.utilisateur_id
            WHERE rm.rapport_medical_id = :rapport_id
            """
        ),
        {"rapport_id": rapport_id},
    ).mappings().first()

    if not report:
        raise HTTPException(status_code=404, detail="Rapport introuvable")

    if current_user["role"] == "Patient":
        patient_id = _get_patient_id(db, current_user["user_id"])
        if not patient_id or int(report["patient_id"] or 0) != patient_id:
            raise HTTPException(status_code=403, detail="Accès refusé")

    bilan = db.execute(
        text(
            """
            SELECT bilan_id, type, statut, nom_fichier, date_generation, patient_id, technicien_id, medecin_id
            FROM bioscan.bilan_biologique
            WHERE bilan_id = :bilan_id
            """
        ),
        {"bilan_id": report["bilan_id"]},
    ).mappings().first()

    anomalies = db.execute(
        text(
            """
            SELECT marqueur, description, severite, valeur_mesuree, valeur_normale
            FROM bioscan.rapport_anomalie
            WHERE bilan_id = :bilan_id
            ORDER BY rapport_id ASC
            """
        ),
        {"bilan_id": report["bilan_id"]},
    ).mappings().all()

    PDF_DIR.mkdir(parents=True, exist_ok=True)
    pdf_path = PDF_DIR / f"rapport_medical_{rapport_id}.pdf"

    doc = SimpleDocTemplate(str(pdf_path), pagesize=A4, rightMargin=2 * cm, leftMargin=2 * cm, topMargin=2 * cm, bottomMargin=2 * cm)
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "BioScanTitle",
        parent=styles["Title"],
        fontSize=20,
        textColor=colors.HexColor("#0f4c81"),
        spaceAfter=14,
    )
    normal_style = styles["BodyText"]
    story = []

    story.append(Paragraph("BioScan - Rapport Médical", title_style))
    story.append(Spacer(1, 0.35 * cm))
    story.append(Paragraph("Zone logo hôpital", styles["Heading3"]))
    story.append(Spacer(1, 0.2 * cm))

    info_rows = [
        ["Patient", report["patient_nom"] or "N/A", "Email", report["patient_email"] or "N/A"],
        ["Téléphone", report["patient_telephone"] or "N/A", "Médecin", report["medecin_nom"] or "N/A"],
        ["Statut", report["statut"] or "N/A", "Date génération", str(report["date_generation"] or "N/A")],
    ]
    info_table = Table(info_rows, colWidths=[3.5 * cm, 5.0 * cm, 3.5 * cm, 5.0 * cm])
    info_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e8f1fb")),
                ("BOX", (0, 0), (-1, -1), 0.75, colors.HexColor("#0f4c81")),
                ("INNERGRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#b7c7d8")),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ]
        )
    )
    story.append(info_table)
    story.append(Spacer(1, 0.5 * cm))

    story.append(Paragraph("Résultats du bilan", styles["Heading2"]))
    if bilan:
        bilan_table = Table(
            [
                ["Bilan ID", bilan["bilan_id"], "Type", bilan["type"] or "N/A"],
                ["Statut", bilan["statut"] or "N/A", "Fichier", bilan["nom_fichier"] or "N/A"],
            ],
            colWidths=[3.5 * cm, 5.0 * cm, 3.5 * cm, 5.0 * cm],
        )
        bilan_table.setStyle(
            TableStyle(
                [
                    ("BOX", (0, 0), (-1, -1), 0.75, colors.HexColor("#0f4c81")),
                    ("INNERGRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#b7c7d8")),
                ]
            )
        )
        story.append(bilan_table)
    else:
        story.append(Paragraph("Aucun bilan associé n'a été trouvé.", normal_style))
    story.append(Spacer(1, 0.5 * cm))

    story.append(Paragraph("Anomalies détectées", styles["Heading2"]))
    if anomalies:
        anomaly_rows = [["Marqueur", "Description", "Sévérité", "Mesuré", "Normal"]]
        for anomaly in anomalies:
            anomaly_rows.append(
                [
                    anomaly["marqueur"] or "N/A",
                    anomaly["description"] or "N/A",
                    anomaly["severite"] or "N/A",
                    str(anomaly["valeur_mesuree"] or "N/A"),
                    anomaly["valeur_normale"] or "N/A",
                ]
            )
        anomaly_table = Table(anomaly_rows, colWidths=[3.0 * cm, 6.0 * cm, 2.5 * cm, 2.5 * cm, 3.0 * cm])
        anomaly_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e8f1fb")),
                    ("BOX", (0, 0), (-1, -1), 0.75, colors.HexColor("#0f4c81")),
                    ("INNERGRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#b7c7d8")),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ]
            )
        )
        story.append(anomaly_table)
    else:
        story.append(Paragraph("Aucune anomalie détectée.", normal_style))
    story.append(Spacer(1, 1.0 * cm))
    story.append(Paragraph("Zone de signature du médecin", styles["Heading3"]))
    story.append(Spacer(1, 1.5 * cm))
    story.append(Paragraph("_______________________________", normal_style))

    doc.build(story)
    logger.info("Generated PDF report %s", pdf_path)
    return FileResponse(str(pdf_path), media_type="application/pdf", filename=pdf_path.name)

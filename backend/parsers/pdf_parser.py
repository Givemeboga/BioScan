import pdfplumber
from .base_parser import BaseParser

class PDFParser(BaseParser):

    def parse(self, file_path: str) -> dict:
        parametres = {}

        with pdfplumber.open(file_path) as pdf:
            text = ""
            for page in pdf.pages:
                text += page.extract_text()

        # Ici tu dois faire regex ou logique extraction
        # Exemple simple :
        # Hemoglobine: 12.5 g/dL
        # Glycemie: 1.2 g/L

        # À adapter selon format réel du labo

        return {
            "type": "GENERAL",
            "parametres": parametres
        }

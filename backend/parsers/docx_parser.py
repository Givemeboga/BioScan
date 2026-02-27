from docx import Document
from .base_parser import BaseParser

class DOCXParser(BaseParser):

    def parse(self, file_path: str) -> dict:
        doc = Document(file_path)
        parametres = {}

        for paragraph in doc.paragraphs:
            # Extraction personnalisée ici
            pass

        return {
            "type": "GENERAL",
            "parametres": parametres
        }

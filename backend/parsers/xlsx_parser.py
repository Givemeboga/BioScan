import pandas as pd
from .base_parser import BaseParser

class XLSXParser(BaseParser):

    def parse(self, file_path: str) -> dict:
        df = pd.read_excel(file_path)

        parametres = {}
        for _, row in df.iterrows():
            parametres[row["parametre"]] = float(row["valeur"])

        return {
            "type": "GENERAL",
            "parametres": parametres
        }

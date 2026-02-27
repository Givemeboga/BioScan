import csv
from .base_parser import BaseParser

class CSVParser(BaseParser):

    def parse(self, file_path: str) -> dict:
        parametres = {}

        with open(file_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                parametres[row["parametre"]] = float(row["valeur"])

        return {
            "type": "GENERAL",
            "parametres": parametres
        }

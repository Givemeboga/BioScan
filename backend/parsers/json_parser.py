import json
from .base_parser import BaseParser

class JSONParser(BaseParser):

    def parse(self, file_path: str) -> dict:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        return {
            "type": data.get("type"),
            "parametres": data.get("parametres")
        }

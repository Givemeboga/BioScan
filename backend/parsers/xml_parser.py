import xml.etree.ElementTree as ET
from .base_parser import BaseParser

class XMLParser(BaseParser):

    def parse(self, file_path: str) -> dict:
        tree = ET.parse(file_path)
        root = tree.getroot()

        parametres = {}
        for param in root.findall("parametre"):
            nom = param.find("nom").text
            valeur = float(param.find("valeur").text)
            parametres[nom] = valeur

        return {
            "type": root.find("type").text,
            "parametres": parametres
        }

import os
from .json_parser import JSONParser
from .xml_parser import XMLParser
from .csv_parser import CSVParser
from .xlsx_parser import XLSXParser
from .pdf_parser import PDFParser
from .docx_parser import DOCXParser


class ParserFactory:

    PARSERS = {
        "json": JSONParser,
        "xml": XMLParser,
        "csv": CSVParser,
        "xlsx": XLSXParser,
        "pdf": PDFParser,
        "docx": DOCXParser,
    }

    @staticmethod
    def get_parser(file_path: str):
        extension = file_path.split(".")[-1].lower()

        parser_class = ParserFactory.PARSERS.get(extension)

        if not parser_class:
            raise ValueError(f"Format non supporté : {extension}")

        return parser_class()

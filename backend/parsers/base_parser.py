from abc import ABC, abstractmethod

class BaseParser(ABC):

    @abstractmethod
    def parse(self, file_path: str) -> dict:
        """
        Doit retourner un dictionnaire standardisé :
        {
            "type": "...",
            "parametres": {
                "hemoglobine": 12.5,
                "glycemie": 1.10
            }
        }
        """
        pass

# Legacy module kept for backward-compatible imports.
# The canonical TechnicienBiologiste model lives in models/technicien.py
# (correct `bioscan` schema, qualified FK, backref="technicien").
# Re-exporting avoids a duplicate class with the same __tablename__, which
# made the string reference "TechnicienBiologiste" ambiguous in the ORM
# registry and broke configuration for ALL mappers.
from models.technicien import TechnicienBiologiste

__all__ = ["TechnicienBiologiste"]

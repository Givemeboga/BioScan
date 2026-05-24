# backend/schemas/__init__.py

from .bilan import (
    BilanBiologiqueList,
    BilanBiologiqueOut,      # alias de BilanBiologiqueDetail
    BilanBiologiqueCreate,
    BilanBiologiqueUpdate,
    BilanDashboardStats,
)

from .profil import (
    ProfilPatientOut,
    ProfilPatientUpdate,
    ProfilMedecinOut,
    ProfilMedecinUpdate,
)

from .notification import (
    NotificationOut,

)

from .dashboard_patient import (
    DashboardPatientOut,
    DashboardStatsPatient,
    BilanRecent,
    MonthlyCount,
)
# schemas/__init__.py

# Option 1 : tout commenter temporairement (le plus simple pour débloquer)
# from .bilan import (
#     BilanBiologiqueBase,
#     BilanBiologiqueCreate,
#     BilanBiologiqueUpdate,
#     BilanBiologiqueOut,
#     BilanBiologiqueList,
# )

# Option 2 : importer seulement ce qui existe vraiment maintenant
from .bilan import (
    BilanBiologiqueList,
    BilanBiologiqueOut,
)
// Mock data for development when backend is unavailable
export const mockAdminStats = {
  overview: {
    totalUsers: 156,
    activeAccounts: 142,
    signalements: 23,
    rapportsGeneres: 89,
  },

  accountsMonthly: {
    monthly: [
      { month: '2026-01-01', count: 12 },
      { month: '2026-01-08', count: 18 },
      { month: '2026-01-15', count: 25 },
      { month: '2026-01-22', count: 15 },
      { month: '2026-02-01', count: 22 },
      { month: '2026-02-08', count: 28 },
      { month: '2026-02-15', count: 20 },
      { month: '2026-02-22', count: 16 },
    ],
  },

  accountStatus: {
    statusBreakdown: {
      actif: 142,
      inactif: 8,
      suspendu: 6,
    },
  },

  recentActivities: {
    activities: [
      {
        id: 1,
        type: 'Nouvel utilisateur',
        user: 'Dr. Martin Dupont',
        timestamp: new Date().toISOString(),
        details: 'Compte médecin créé',
      },
      {
        id: 2,
        type: 'Rapport généré',
        user: 'Tech. Sophie Bernard',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        details: 'Rapport d\'analyse biologique',
      },
      {
        id: 3,
        type: 'Signalement',
        user: 'Dr. Claire Dubois',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        details: 'Anomalie détectée sur échantillon',
      },
      {
        id: 4,
        type: 'Modification compte',
        user: 'Admin System',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        details: 'Statut utilisateur mis à jour',
      },
      {
        id: 5,
        type: 'Nouvel utilisateur',
        user: 'Tech. Jean Moreau',
        timestamp: new Date(Date.now() - 14400000).toISOString(),
        details: 'Compte technicien créé',
      },
      {
        id: 6,
        type: 'Rapport généré',
        user: 'Dr. Antoine Lefebvre',
        timestamp: new Date(Date.now() - 18000000).toISOString(),
        details: 'Bilan biologique complet',
      },
      {
        id: 7,
        type: 'Connexion',
        user: 'Dr. Marie Lambert',
        timestamp: new Date(Date.now() - 21600000).toISOString(),
        details: 'Authentification réussie',
      },
      {
        id: 8,
        type: 'Signalement',
        user: 'Tech. Pierre Rousseau',
        timestamp: new Date(Date.now() - 25200000).toISOString(),
        details: 'Équipement nécessitant maintenance',
      },
      {
        id: 9,
        type: 'Modification compte',
        user: 'Admin System',
        timestamp: new Date(Date.now() - 28800000).toISOString(),
        details: 'Rôle utilisateur modifié',
      },
      {
        id: 10,
        type: 'Rapport généré',
        user: 'Dr. Thomas Petit',
        timestamp: new Date(Date.now() - 32400000).toISOString(),
        details: 'Analyse hématologique',
      },
    ],
  },
};

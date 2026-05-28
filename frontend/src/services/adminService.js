import apiClient from './api';

// USERS Management
export const usersService = {
  async getUsers(params = {}) {
    return apiClient.get('/api/admin/users', params);
  },

  async createUser(userData) {
    const payload = {
      nom: userData.nom,
      nom_utilisateur: userData.nom_utilisateur ?? userData.nom,
      email: userData.email,
      telephone: userData.telephone,
      status: userData.status,
      statut: userData.statut ?? userData.status,
      role: userData.role,
      mot_de_passe: userData.mot_de_passe ?? userData.motDePasse ?? userData.password,
    };
    return apiClient.post('/api/admin/users', payload);
  },

  async updateUser(userId, userData) {
    return apiClient.put(`/api/admin/users/${userId}`, userData);
  },

  async deleteUser(userId) {
    return apiClient.delete(`/api/admin/users/${userId}`);
  },

  async updateUserStatus(userId, status) {
    return apiClient.patch(`/api/admin/users/${userId}/status`, { status });
  },

  async resetUserPassword(userId) {
    return apiClient.post(`/api/admin/users/${userId}/reset-password`);
  },

  async getLoginHistory(userId, limit = 20) {
    return apiClient.get(`/api/admin/users/${userId}/login-history`, { limit });
  },

  async bulkUpdateRole(userIds, newRole) {
    return apiClient.patch('/api/admin/users/bulk/role', {
      userIds,
      newRole,
    });
  },
};

// MEDECINS Management
export const medecinsService = {
  async getMedecins(params = {}) {
    return apiClient.get('/api/admin/medecins', params);
  },

  async createMedecin(medecinData) {
    return apiClient.post('/api/admin/medecins', medecinData);
  },

  async updateMedecin(medecinId, medecinData) {
    return apiClient.put(`/api/admin/medecins/${medecinId}`, medecinData);
  },

  async deleteMedecin(medecinId) {
    return apiClient.delete(`/api/admin/medecins/${medecinId}`);
  },

  async updateMedecinStatus(medecinId, status) {
    return apiClient.patch(`/api/admin/medecins/${medecinId}/status`, { status });
  },
};

// TECHNICIENS Management
export const techniciensService = {
  async getTechniciens(params = {}) {
    return apiClient.get('/api/admin/techniciens', params);
  },

  async createTechnicien(technicienData) {
    return apiClient.post('/api/admin/techniciens', technicienData);
  },

  async updateTechnicien(technicienId, technicienData) {
    return apiClient.put(`/api/admin/techniciens/${technicienId}`, technicienData);
  },

  async deleteTechnicien(technicienId) {
    return apiClient.delete(`/api/admin/techniciens/${technicienId}`);
  },

  async updateTechnicienStatus(technicienId, status) {
    return apiClient.patch(
      `/api/admin/techniciens/${technicienId}/status`,
      { status }
    );
  },
};

// REPORTS Management
export const reportsService = {
  async getReports(params = {}) {
    return apiClient.get('/api/admin/reports', params);
  },

  async deleteReport(reportId) {
    return apiClient.delete(`/api/admin/reports/${reportId}`);
  },

  async getReportStats() {
    return apiClient.get('/api/admin/reports/stats');
  },
};

// NOTIFICATIONS (flux d'événements système / sécurité)
export const notificationsService = {
  async getNotifications(params = {}) {
    return apiClient.get('/api/admin/notifications', params);
  },

  async getCount() {
    return apiClient.get('/api/admin/notifications/count');
  },

  async deleteNotification(evenementId) {
    return apiClient.delete(`/api/admin/notifications/${evenementId}`);
  },
};

// DASHBOARD Stats
export const dashboardService = {
  async getOverview() {
    return apiClient.get('/api/admin/stats/overview');
  },

  async getAccountsMonthly() {
    return apiClient.get('/api/admin/stats/accounts-monthly');
  },

  async getAccountStatus() {
    return apiClient.get('/api/admin/stats/account-status');
  },

  async getRecentActivities(limit = 10) {
    return apiClient.get('/api/admin/stats/recent-activities', { limit });
  },
};

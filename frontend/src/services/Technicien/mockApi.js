// Mock API pour l'interface Technicien — stocke les données dans localStorage
// Reflète partiellement le schéma SQL fourni : bilan_biologique, notifications, utilisateur

const KEY_BILAN = "bilan_biologique";
const KEY_NOTIF = "notifications";
const KEY_USER = "utilisateur_mock";

function seedIfEmpty() {
  if (!localStorage.getItem(KEY_USER)) {
    const user = {
      utilisateur_id: 1,
      nom_utilisateur: "Technicien Local",
      email: "tech@bioscan.local",
      statut: "ACTIVE",
    };
    localStorage.setItem(KEY_USER, JSON.stringify(user));
  }

  if (!localStorage.getItem(KEY_BILAN)) {
    const seed = [
      {
        bilan_id: 1057,
        statut: "REJETE",
        type: "CSV",
        nom_fichier: "tests_covid_2026.csv",
        date_generation: new Date().toISOString(),
        patient_id: 201,
        technicien_id: 11,
        anomaly_count: 2,
        notes: "Colonnes manquantes sur plusieurs lignes"
      },
      {
        bilan_id: 1056,
        statut: "VALIDE",
        type: "CSV",
        nom_fichier: "resultats_patient_b56.csv",
        date_generation: new Date().toISOString(),
        patient_id: 202,
        technicien_id: 11
      },
      {
        bilan_id: 1055,
        statut: "EN_COURS",
        type: "XLSX",
        nom_fichier: "etude_glucose_mod_01.xlsx",
        date_generation: new Date().toISOString(),
        patient_id: 203,
        technicien_id: 11
      }
    ];
    localStorage.setItem(KEY_BILAN, JSON.stringify(seed));
  }

  if (!localStorage.getItem(KEY_NOTIF)) {
    const notifs = [
      { notification_id: 1, titre: "Upload réussi", description: "tests_covid_2026.csv : upload terminé", statut: "UNREAD", date_generation: new Date().toISOString(), utilisateur_id: 1 },
      { notification_id: 2, titre: "Erreur d'analyse", description: "Colonnes manquantes détectées", statut: "UNREAD", date_generation: new Date().toISOString(), utilisateur_id: 1 }
    ];
    localStorage.setItem(KEY_NOTIF, JSON.stringify(notifs));
  }
}

function read(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}

function write(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

/* Bilans (bilan_biologique) */
export function getAllBilans() {
  seedIfEmpty();
  return Promise.resolve(read(KEY_BILAN) || []);
}

export function getBilanById(id) {
  const list = read(KEY_BILAN) || [];
  return Promise.resolve(list.find((b) => +b.bilan_id === +id) || null);
}

export function createBilan(payload) {
  const list = read(KEY_BILAN) || [];
  const nextId = Date.now();
  const newBilan = {
    bilan_id: nextId,
    statut: payload.statut || "BROUILLON",
    type: payload.type || "CSV",
    nom_fichier: payload.nom_fichier || payload.name || `file_${nextId}`,
    date_generation: new Date().toISOString(),
    patient_id: payload.patient_id || null,
    technicien_id: payload.technicien_id || null,
    anomaly_count: payload.anomaly_count || 0,
    notes: payload.notes || ""
  };
  list.unshift(newBilan);
  write(KEY_BILAN, list);
  window.dispatchEvent(new Event("bioscan_bilan_changed"));
  return Promise.resolve(newBilan);
}

export function updateBilan(id, patch) {
  const list = read(KEY_BILAN) || [];
  const idx = list.findIndex((b) => +b.bilan_id === +id);
  if (idx === -1) return Promise.reject(new Error("Not found"));
  list[idx] = { ...list[idx], ...patch, date_generation: list[idx].date_generation };
  write(KEY_BILAN, list);
  window.dispatchEvent(new Event("bioscan_bilan_changed"));
  return Promise.resolve(list[idx]);
}

export function deleteBilan(id) {
  let list = read(KEY_BILAN) || [];
  list = list.filter((b) => +b.bilan_id !== +id);
  write(KEY_BILAN, list);
  window.dispatchEvent(new Event("bioscan_bilan_changed"));
  return Promise.resolve(true);
}

/* Notifications */
export function getNotifications() {
  seedIfEmpty();
  return Promise.resolve(read(KEY_NOTIF) || []);
}

export function markNotificationRead(id) {
  const list = read(KEY_NOTIF) || [];
  const idx = list.findIndex((n) => +n.notification_id === +id);
  if (idx >= 0) {
    list[idx].statut = "READ";
    list[idx].date_mise_a_jour = new Date().toISOString();
    write(KEY_NOTIF, list);
    window.dispatchEvent(new Event("bioscan_notif_changed"));
  }
  return Promise.resolve(true);
}

/* Utilisateur courant (mock) */
export function getCurrentUser() {
  seedIfEmpty();
  return Promise.resolve(read(KEY_USER));
}
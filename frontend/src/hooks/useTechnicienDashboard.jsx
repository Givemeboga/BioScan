import { useState, useEffect, useCallback } from "react";
import { getAllBilans } from "../services/Technicien/bilanService";
import { getNotifications } from "../services/Technicien/notificationService";

export default function useTechnicienDashboard() {
  const [files, setFiles] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [bilans, notifs] = await Promise.all([
        getAllBilans(),
        getNotifications()
      ]);

      const mappedFiles = bilans.map(bilan => ({
        id: bilan.bilan_id,
        filename: bilan.nom_fichier,
        status:
          bilan.statut === "VALIDE"
            ? "Terminé"
            : bilan.statut === "EN_COURS"
            ? "En cours"
            : "Erreur",
        date: new Date(bilan.date_generation).toLocaleDateString("fr-FR"),
        uploadedAt: bilan.date_generation,
        anomalies: bilan.anomaly_count || 0,
        notes: bilan.notes || "",
        size: bilan.taille || "2.4 Mo"
      }));

      setFiles(mappedFiles);
      setNotifications(notifs);

    } catch (e) {
      console.error("Erreur Dashboard:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return {
    files,
    notifications,
    loading,
    reload: loadDashboard,
    setFiles
  };
}
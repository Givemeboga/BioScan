const BASE_URL = "http://localhost:8000/api/notifications";

// 🔹 Helper pour récupérer le token
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// 🔹 Helper fetch + gestion erreur
async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);

  if (!res.ok) {
    let errorMessage = `Erreur ${res.status}`;
    try {
      const data = await res.json();
      if (data.detail) errorMessage = data.detail;
    } catch { /* response body is not JSON — keep default message */ }
    throw new Error(errorMessage);
  }

  // Certaines routes DELETE renvoient juste un 200 sans body
  if (res.status === 204 || (res.status === 200 && res.headers.get("Content-Length") === "0")) {
    return true;
  }

  return await res.json();
}

/* =========================================================
   1️⃣ Récupérer toutes les notifications
========================================================= */
export async function getNotifications() {
  return fetchJSON(BASE_URL, { headers: getAuthHeaders() });
}

/* =========================================================
   2️⃣ Récupérer seulement les notifications UNREAD
========================================================= */
export async function getUnreadNotifications() {
  return fetchJSON(`${BASE_URL}?statut=UNREAD`, { headers: getAuthHeaders() });
}

/* =========================================================
   3️⃣ Compteur notifications non lues
========================================================= */
export async function getUnreadCount() {
  return fetchJSON(`${BASE_URL}/unread-count`, { headers: getAuthHeaders() });
}

/* =========================================================
   4️⃣ Marquer une notification comme lue
========================================================= */
export async function markAsRead(id) {
  return fetchJSON(`${BASE_URL}/${id}/read`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
}

/* =========================================================
   5️⃣ Marquer toutes les notifications comme lues
========================================================= */
export async function markAllAsRead() {
  return fetchJSON(`${BASE_URL}/read-all`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
}

/* =========================================================
   6️⃣ Supprimer une notification
========================================================= */
export async function deleteNotification(id) {
  return fetchJSON(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
}
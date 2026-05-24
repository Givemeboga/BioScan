// services/Technicien/bilanService.js

const BASE_URL = "http://localhost:8000/api/bilans-biologiques";

export async function getAllBilans() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Erreur récupération bilans");
  return await res.json();
}

export async function getBilanById(id) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Erreur récupération détail bilan");
  return await res.json();
}

export async function createBilan(data) {
  const token = localStorage.getItem("token");
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erreur création bilan");
  return await res.json();
}

export async function deleteBilan(id) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Erreur suppression bilan");

  return true; // pas besoin de json
}
export async function updateBilan(id, data) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Erreur mise à jour bilan");

  return await res.json();
}
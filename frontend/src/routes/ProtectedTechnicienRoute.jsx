import { Navigate } from "react-router-dom";

export default function ProtectedTechnicienRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Pas connecté
  if (!token) {
    return <Navigate to="/login-technicien" replace />;
  }

  // Pas technicien
  if (role !== "technicien") {
    return <Navigate to="/" replace />;
  }

  return children;
}

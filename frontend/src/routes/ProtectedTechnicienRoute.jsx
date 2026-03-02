import { Navigate } from "react-router-dom";
import { ensureAuthenticated } from "../services/Technicien/authService";

export default function ProtectedTechnicienRoute({ children }) {
  const isAuth = ensureAuthenticated();

  if (!isAuth) {
    return <Navigate to="/login-technicien" replace />;
  }

  return children;
}
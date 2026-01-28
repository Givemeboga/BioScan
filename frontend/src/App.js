import { BrowserRouter, Routes, Route } from "react-router-dom";
import BaseDashboardLayout from "./layouts/BaseDashboardLayout";
import BaseDashboard from "./pages/BaseDashboard";
import TechnicienDashboard from "./pages/technicien/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<BaseDashboardLayout />}>
          <Route path="/" element={<BaseDashboard />} />
          <Route path="/technicien" element={<TechnicienDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

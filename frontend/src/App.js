import { BrowserRouter, Routes, Route } from "react-router-dom";
import BaseDashboardLayout from "./layouts/BaseDashboardLayout";
import Welcome from "./pages/Welcome";
import TechnicienDashboard from "./pages/technicien/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route element={<BaseDashboardLayout />}>
          <Route path="/technicien" element={<TechnicienDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

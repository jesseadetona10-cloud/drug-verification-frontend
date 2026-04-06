import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ManufacturerDashboard from "./pages/ManufacturerDashboard";
import MyDrugsPage from "./pages/MyDrugsPage";
import PharmacistDashboard from "./pages/PharmacistDashboard";
import RegulatorDashboard from "./pages/RegulatorDashboard";
import PatientPage from "./pages/PatientPage";
import AlertsPage from "./pages/AlertsPage";
import UsersPage from "./pages/UsersPage";

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-700"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" />;
  return children;
};

const DashboardRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  const routes = { manufacturer: "/manufacturer", pharmacist: "/pharmacist", regulator: "/regulator", patient: "/patient", wholesaler: "/pharmacist" };
  return <Navigate to={routes[user.role] || "/login"} />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
          <Route path="/manufacturer" element={<ProtectedRoute roles={["manufacturer"]}><ManufacturerDashboard /></ProtectedRoute>} />
          <Route path="/manufacturer/drugs" element={<ProtectedRoute roles={["manufacturer"]}><MyDrugsPage /></ProtectedRoute>} />
          <Route path="/manufacturer/batches" element={<ProtectedRoute roles={["manufacturer"]}><MyDrugsPage /></ProtectedRoute>} />
          <Route path="/manufacturer/alerts" element={<ProtectedRoute roles={["manufacturer"]}><AlertsPage /></ProtectedRoute>} />
          <Route path="/pharmacist" element={<ProtectedRoute roles={["pharmacist","wholesaler"]}><PharmacistDashboard /></ProtectedRoute>} />
          <Route path="/pharmacist/verify" element={<ProtectedRoute roles={["pharmacist","wholesaler"]}><PharmacistDashboard /></ProtectedRoute>} />
          <Route path="/pharmacist/history" element={<ProtectedRoute roles={["pharmacist","wholesaler"]}><PharmacistDashboard /></ProtectedRoute>} />
          <Route path="/regulator" element={<ProtectedRoute roles={["regulator"]}><RegulatorDashboard /></ProtectedRoute>} />
          <Route path="/regulator/drugs" element={<ProtectedRoute roles={["regulator"]}><RegulatorDashboard /></ProtectedRoute>} />
          <Route path="/regulator/alerts" element={<ProtectedRoute roles={["regulator"]}><AlertsPage /></ProtectedRoute>} />
          <Route path="/regulator/analytics" element={<ProtectedRoute roles={["regulator"]}><RegulatorDashboard /></ProtectedRoute>} />
          <Route path="/regulator/users" element={<ProtectedRoute roles={["regulator"]}><UsersPage /></ProtectedRoute>} />
          <Route path="/patient" element={<ProtectedRoute roles={["patient"]}><PatientPage /></ProtectedRoute>} />
          <Route path="/patient/history" element={<ProtectedRoute roles={["patient"]}><PatientPage /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

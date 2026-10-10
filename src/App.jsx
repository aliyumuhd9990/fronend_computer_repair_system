import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import LoadingScreen from "./components/LoadingScreen";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import DevicesPage from "./pages/DevicesPage";
import RepairFormPage from "./pages/RepairFormPage";
import RepairsPage from "./pages/RepairsPage";
import RepairDetailPage from "./pages/RepairDetailPage";
import PaymentsPage from "./pages/PaymentsPage";
import TechniciansPage from "./pages/TechniciansPage";

export default function App() {
  const { loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/devices" element={<ProtectedRoute roles={["customer", "admin"]} />}><Route index element={<DevicesPage />} /></Route>
        <Route path="/repairs" element={<RepairsPage />} />
        <Route path="/repairs/new" element={<ProtectedRoute roles={["customer", "admin"]} />}><Route index element={<RepairFormPage />} /></Route>
        <Route path="/repairs/:id" element={<RepairDetailPage />} />
        <Route path="/payments" element={<ProtectedRoute roles={["customer", "admin"]} />}><Route index element={<PaymentsPage />} /></Route>
        <Route path="/technicians" element={<ProtectedRoute roles={["admin"]} />}><Route index element={<TechniciansPage />} /></Route>
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>;
}

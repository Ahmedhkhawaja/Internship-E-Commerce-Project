import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthConttext";

export default function AdminRoute() {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-6">Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/products" replace />;
  }

  return <Outlet />;
}

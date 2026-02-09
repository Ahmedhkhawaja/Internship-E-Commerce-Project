import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAuthLoading, selectAuthUser } from "../store/authSlice";

export default function AdminRoute() {
  // Gate admin-only routes and redirect non-admins.
  const user = useSelector(selectAuthUser);
  const loading = useSelector(selectAuthLoading);

  if (loading) return <div className="p-6">Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/products" replace />;
  }

  return <Outlet />;
}

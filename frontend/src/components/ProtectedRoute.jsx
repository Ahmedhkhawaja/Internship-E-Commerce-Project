import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAuthLoading, selectAuthUser } from "../store/authSlice";

export default function ProtectedRoute() {
  // Gate user-only routes and redirect to login if unauthenticated.
  const user = useSelector(selectAuthUser);
  const loading = useSelector(selectAuthLoading);

  if (loading) return <div className="p-6">Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}


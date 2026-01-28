import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthConttext";
import { useCart } from "../cart/CartContext";

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const { totalItems } = useCart();

  if (loading) {
    return <div className="p-4 border-b">Loading...</div>;
  }

  return (
    <div className="border-b">
      <div className="p-4 flex items-center gap-4">

        <Link to="/products">Products</Link>

        <div className="ml-auto flex items-center gap-3">

          {!user && (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}

          {user && (
            <>
              <span className="text-sm opacity-70">{user.email}</span>
              <Link to="/cart">Cart ({totalItems})</Link>
              <Link to="/orders">Orders</Link>

              {user.role === "admin" && (
                <Link to="/admin" className="font-semibold">
                  Admin
                </Link>
              )}

              <button
                onClick={logout}
                className="border px-2 py-1 rounded"
              >
                Logout 
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

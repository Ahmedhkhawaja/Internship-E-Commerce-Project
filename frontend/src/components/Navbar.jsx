import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout, selectAuthLoading, selectAuthUser } from "../store/authSlice";
import { selectTotalItems } from "../store/cartSlice";

export default function Navbar() {
  const dispatch = useDispatch();
  const user = useSelector(selectAuthUser);
  const loading = useSelector(selectAuthLoading);
  const totalItems = useSelector(selectTotalItems);
  const navigate = useNavigate();

  // Avoid showing partial nav while auth state is loading.
  if (loading) {
    return <div className="p-4 border-b">Loading...</div>;
  }

  return (
    <header className="bg-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
        <Link to="/products" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold">
            G
          </div>
          <div>
            <div className="text-lg font-bold">Gym Store</div>
            <div className="text-xs text-gray-500 uppercase tracking-widest">
              Premium Gear
            </div>
          </div>
        </Link>

        <div className="ml-auto flex items-center gap-3">
          {user && (
            <span className="hidden sm:inline text-sm text-gray-500">
              {user.email}
            </span>
          )}

          {user && (
            <Link
              to="/orders"
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              Orders
            </Link>
          )}

          {user?.role === "admin" && (
            <Link
              to="/admin"
              className="text-sm font-semibold text-red-600"
            >
              Admin
            </Link>
          )}

          <Link
            to="/cart"
            className="relative flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1 text-sm hover:border-red-600 transition-colors"
          >
            <span className="text-lg">🛒</span>
            <span className="font-semibold">Cart</span>
            {totalItems > 0 && (
              <span className="ml-1 rounded-full bg-red-600 px-2 py-0.5 text-xs text-white">
                {totalItems}
              </span>
            )}
          </Link>

          {user && (
            <button
              onClick={() => {
                dispatch(logout());
                navigate("/login");
              }}
              className="rounded-full border border-gray-200 px-3 py-1 text-sm hover:border-red-600"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

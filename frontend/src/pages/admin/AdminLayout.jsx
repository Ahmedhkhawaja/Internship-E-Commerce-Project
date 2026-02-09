import { Link, Outlet } from "react-router-dom";

export default function AdminLayout() {
  // Shared admin shell with navigation.
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg p-6 mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">
              Manage products and monitor orders.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              className="rounded-full border border-gray-200 px-4 py-2 text-sm hover:border-red-600"
              to="/admin/products"
            >
              Products
            </Link>
            <Link
              className="rounded-full border border-gray-200 px-4 py-2 text-sm hover:border-red-600"
              to="/admin/products/new"
            >
              New Product
            </Link>
            <Link
              className="rounded-full border border-gray-200 px-4 py-2 text-sm hover:border-red-600"
              to="/admin/orders"
            >
              Orders
            </Link>
          </div>
        </div>
      </div>

      <Outlet />
    </div>
  );
}

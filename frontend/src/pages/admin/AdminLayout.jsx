import { Link, Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin</h1>

      <div className="flex gap-4 mb-6">
        <Link className="underline" to="/admin/products">Products</Link>
        <Link className="underline" to="/admin/products/new">New Product</Link>
        <Link className="underline" to="/admin/orders">Orders</Link>
      </div>

      <Outlet />
    </div>
  );
}

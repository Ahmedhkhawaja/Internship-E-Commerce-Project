import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { http } from "../../api/http";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // Admin list includes user email via backend populate.
        const res = await http.get("/api/admin/orders");

        if (cancelled) return;

        const items = Array.isArray(res.data) ? res.data : res.data.orders || [];
        setOrders(items);
      } catch (e) {
        if (!cancelled) setError("Failed to load orders");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div className="text-sm text-gray-500">Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">All Orders</h2>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
          No orders yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {orders.map((order) => (
            <div key={order._id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-lg">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="font-semibold">
                    Order #{order._id.slice(-8)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {order.userId?.email || "Unknown user"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()} at{" "}
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </div>
                </div>
                <div className="text-xs uppercase tracking-wide rounded-full border border-gray-200 px-3 py-1">
                  {order.status}
                </div>
              </div>

              <div className="mt-3 font-semibold text-red-600">
                ${(order.totalCents / 100).toFixed(2)}
              </div>

              <Link
                to={`/admin/orders/${order._id}`}
                className="mt-3 inline-flex text-sm font-semibold text-red-600"
              >
                View details →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


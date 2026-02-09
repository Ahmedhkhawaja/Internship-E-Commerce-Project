import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { http } from "../api/http";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // Fetch current user's orders.
        const res = await http.get("/api/orders/my");

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

  if (loading) return <div className="p-6 text-sm text-gray-500">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>

      {orders.length === 0 ? (
        <div>
          <p className="mb-2">No orders yet.</p>
          <Link className="underline" to="/products">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {orders.map((order) => (
            <div key={order._id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">
                    Order #{order._id.slice(-8)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()} at{" "}
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </div>
                </div>
                <div className="text-xs uppercase rounded-full border border-gray-200 px-3 py-1">
                  {order.status}
                </div>
              </div>

              <div className="mt-3 font-semibold text-red-600">
                ${(order.totalCents / 100).toFixed(2)}
              </div>

              <Link
                to={`/orders/${order._id}`}
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


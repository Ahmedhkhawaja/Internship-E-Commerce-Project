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

  if (loading) return <div className="p-6 text-xl font-semibold">Loading...</div>;
  if (error) return <div className="p-6 text-xl font-semibold">{error}</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">My Orders</h1>

      {orders.length === 0 ? (
        <div>
          <p className="mb-2">No orders yet.</p>
          <Link className="underline" to="/products">
            Browse products
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li key={order._id} className="border rounded p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">
                    Order #{order._id.slice(-8)}
                  </div>
                  <div className="text-sm opacity-70">
                    {new Date(order.createdAt).toLocaleDateString()} at{" "}
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </div>
                </div>
                <div className="text-sm px-2 py-1 rounded border">
                  {order.status}
                </div>
              </div>

              <div className="mt-2 font-semibold">
                ${(order.totalCents / 100).toFixed(2)}
              </div>

              <Link
                to={`/orders/${order._id}`}
                className="mt-2 inline-block underline text-sm"
              >
                View details
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


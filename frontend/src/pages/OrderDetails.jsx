import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { http } from "../api/http";

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await http.get(`/api/orders/${id}`);

        if (cancelled) return;

        setOrder(res.data);
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || "Failed to load order");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <div className="p-6 text-xl font-semibold">Loading...</div>;
  if (error) return <div className="p-6 text-xl font-semibold">{error}</div>;
  if (!order) return <div className="p-6">Order not found</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link to="/orders" className="underline text-sm mb-4 inline-block">
        ← Back to orders
      </Link>

      <h1 className="text-xl font-bold mb-2">Order Details</h1>

      <div className="border rounded p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="font-semibold">Order #{order._id.slice(-8)}</div>
            <div className="text-sm opacity-70">
              {new Date(order.createdAt).toLocaleDateString()} at{" "}
              {new Date(order.createdAt).toLocaleTimeString()}
            </div>
          </div>
          <div className="text-sm px-2 py-1 rounded border">
            {order.status}
          </div>
        </div>
      </div>

      <h2 className="font-semibold mb-3">Items</h2>
      <ul className="space-y-2 mb-6">
        {order.items.map((item, idx) => (
          <li key={idx} className="border rounded p-3">
            <div className="font-semibold">{item.name}</div>
            <div className="text-sm opacity-70">
              ${(item.priceCents / 100).toFixed(2)} × {item.quantity}
            </div>
            <div className="mt-1">
              Subtotal: ${((item.priceCents * item.quantity) / 100).toFixed(2)}
            </div>
          </li>
        ))}
      </ul>

      <div className="border-t pt-4">
        <div className="font-bold text-lg">
          Total: ${(order.totalCents / 100).toFixed(2)}
        </div>
      </div>
    </div>
  );
}


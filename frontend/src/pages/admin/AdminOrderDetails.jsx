import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { http } from "../../api/http";

const ORDER_STATUSES = ["pending", "paid", "cancelled", "shipped", "delivered"];

export default function AdminOrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await http.get(`/api/admin/orders/${id}`);

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

  async function handleStatusChange(newStatus) {
    setError("");
    setUpdating(true);

    try {
      const res = await http.patch(`/api/admin/orders/${id}`, {
        status: newStatus,
      });

      setOrder(res.data);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <div>Loading...</div>;
  if (error && !order) return <div className="text-red-600">{error}</div>;
  if (!order) return <div>Order not found</div>;

  return (
    <div>
      <Link to="/admin/orders" className="underline text-sm mb-4 inline-block">
        ← Back to all orders
      </Link>

      <h2 className="text-xl font-bold mb-2">Order Details</h2>

      <div className="border rounded p-4 mb-4">
        <div className="mb-2">
          <div className="font-semibold">Order #{order._id.slice(-8)}</div>
          <div className="text-sm opacity-70">
            Customer: {order.userId?.email || "Unknown"}
          </div>
          <div className="text-sm opacity-70">
            {new Date(order.createdAt).toLocaleDateString()} at{" "}
            {new Date(order.createdAt).toLocaleTimeString()}
          </div>
        </div>

        <div className="mt-3">
          <label className="block text-sm font-semibold mb-2">
            Order Status:
          </label>
          <div className="flex gap-2">
            {ORDER_STATUSES.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={updating || order.status === status}
                className={`px-3 py-1 rounded border text-sm disabled:opacity-50 ${
                  order.status === status
                    ? "bg-gray-200 font-semibold"
                    : "hover:bg-gray-50"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
      </div>

      <h3 className="font-semibold mb-3">Items</h3>
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


import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { http } from "../../api/http";

// Admin can move orders through a simple status workflow.
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
      // Persist status updates to the backend.
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

  if (loading) return <div className="text-sm text-gray-500">Loading...</div>;
  if (error && !order) return <div className="text-red-600">{error}</div>;
  if (!order) return <div>Order not found</div>;

  return (
    <div>
      <Link
        to="/admin/orders"
        className="text-sm text-gray-500 inline-flex items-center gap-2"
      >
        ← Back to all orders
      </Link>

      <h2 className="text-xl font-bold mt-3 mb-4">Order Details</h2>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-lg mb-6">
        <div className="mb-3">
          <div className="font-semibold">Order #{order._id.slice(-8)}</div>
          <div className="text-sm text-gray-500">
            Customer: {order.userId?.email || "Unknown"}
          </div>
          <div className="text-sm text-gray-500">
            {new Date(order.createdAt).toLocaleDateString()} at{" "}
            {new Date(order.createdAt).toLocaleTimeString()}
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-semibold mb-2">
            Order Status
          </label>
          <div className="flex flex-wrap gap-2">
            {ORDER_STATUSES.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={updating || order.status === status}
                className={`px-3 py-1 rounded-full border text-sm disabled:opacity-50 ${
                  order.status === status
                    ? "bg-red-600 text-white border-red-600"
                    : "border-gray-200 hover:border-red-600"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="text-red-600 text-sm mt-3">{error}</div>}
      </div>

      <h3 className="font-semibold mb-3">Items</h3>
      <div className="grid gap-3 md:grid-cols-2">
        {order.items.map((item, idx) => (
        <div key={idx} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-lg">
            <div className="font-semibold">{item.name}</div>
            <div className="text-sm text-gray-500">
              ${(item.priceCents / 100).toFixed(2)} × {item.quantity}
            </div>
            <div className="mt-1 font-semibold">
              Subtotal: ${((item.priceCents * item.quantity) / 100).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-lg">
        <div className="font-bold text-lg text-red-600">
          Total: ${(order.totalCents / 100).toFixed(2)}
        </div>
      </div>
    </div>
  );
}


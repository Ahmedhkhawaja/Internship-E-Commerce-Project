import { useCallback, useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { http } from "../api/http";

export default function OrderDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const loadOrder = useCallback(async () => {
    try {
      const res = await http.get(`/api/orders/${id}`);
      setOrder(res.data);
      return res.data;
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load order");
      return null;
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    loadOrder().then((data) => {
      if (cancelled) return;
      if (data) setOrder(data);
    });

    return () => {
      cancelled = true;
    };
  }, [id, loadOrder]);

  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");

    if (success) {
      // Poll briefly for webhook confirmation after Stripe redirect.
      setStatusMessage("Payment received. Confirming your order...");
      let attempts = 0;
      const interval = setInterval(async () => {
        attempts += 1;
        const data = await loadOrder();
        if (data?.status === "paid") {
          setStatusMessage("Payment confirmed. Thank you!");
          clearInterval(interval);
        } else if (data?.status === "cancelled") {
          setStatusMessage("Payment was cancelled.");
          clearInterval(interval);
        } else if (attempts >= 10) {
          setStatusMessage("Payment confirmation is taking longer than expected.");
          clearInterval(interval);
        }
      }, 2000);

      return () => clearInterval(interval);
    }

    if (canceled) {
      setStatusMessage("Payment was canceled. You can try again.");
    }
  }, [searchParams, loadOrder]);

  if (loading) return <div className="p-6 text-sm text-gray-500">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!order) return <div className="p-6">Order not found</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Link to="/orders" className="text-sm text-gray-500 inline-flex items-center gap-2">
        ← Back to orders
      </Link>

      <h1 className="text-2xl font-bold mt-3 mb-4">Order Details</h1>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-lg mb-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-semibold">Order #{order._id.slice(-8)}</div>
            <div className="text-sm text-gray-500">
              {new Date(order.createdAt).toLocaleDateString()} at{" "}
              {new Date(order.createdAt).toLocaleTimeString()}
            </div>
          </div>
          <div className="text-xs uppercase tracking-wide rounded-full border border-gray-200 px-3 py-1">
            {order.status}
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-700 shadow-lg">
          {statusMessage}
        </div>
      )}

      {order.status !== "paid" && (
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-lg flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-semibold">Payment required</div>
            <div className="text-sm text-gray-500">Complete checkout to confirm payment.</div>
          </div>
          <div className="flex items-center gap-3">
            {payError && <span className="text-sm text-red-600">{payError}</span>}
            <button
              onClick={handleCheckout}
              disabled={paying}
              className="rounded-xl bg-red-600 px-4 py-2 text-white font-semibold hover:bg-red-700 disabled:opacity-60"
            >
              {paying ? "Redirecting..." : "Pay with Stripe"}
            </button>
          </div>
        </div>
      )}

      <h2 className="font-semibold mb-3">Items</h2>
      <div className="grid grid-cols-2 gap-4">
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

  async function handleCheckout() {
    setPayError("");
    setPaying(true);
    try {
      // Create a Checkout session and redirect to Stripe-hosted page.
      const res = await http.post("/api/payments/checkout", { orderId: order._id });
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        setPayError("Checkout failed to start");
        setPaying(false);
      }
    } catch (e) {
      setPayError(e?.response?.data?.message || "Failed to start checkout");
      setPaying(false);
    }
  }
}


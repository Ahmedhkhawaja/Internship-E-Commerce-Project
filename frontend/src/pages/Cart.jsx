import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthConttext";
import { useCart } from "../cart/CartContext";
import { http } from "../api/http";

export default function Cart() {
  const { items, updateQty, removeFromCart, totalPriceCents, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  if (items.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold mb-2">Cart</h1>
        <p>Your cart is empty.</p>
        <Link className="underline" to="/products">Go to products</Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Cart</h1>

      <ul className="space-y-3">
        {items.map((i) => (
          <li key={i.productId} className="border rounded p-3">
            <div className="font-semibold">{i.name}</div>
            <div className="text-sm opacity-70">
              ${(i.priceCents / 100).toFixed(2)} each
            </div>

            <div className="mt-2 flex items-center gap-2">
              <button
                className="border px-2 rounded"
                onClick={() => updateQty(i.productId, i.quantity - 1)}
              >
                -
              </button>

              <span className="min-w-8 text-center">{i.quantity}</span>

              <button
                className="border px-2 rounded"
                onClick={() => updateQty(i.productId, i.quantity + 1)}
              >
                +
              </button>

              <button
                className="ml-auto text-red-600 underline"
                onClick={() => removeFromCart(i.productId)}
              >
                Remove
              </button>
            </div>

            <div className="mt-2">
              Line total: ${((i.priceCents * i.quantity) / 100).toFixed(2)}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 border-t pt-4">
        <div className="font-bold mb-3">
          Total: ${(totalPriceCents / 100).toFixed(2)}
        </div>

        {error && (
          <div className="text-red-600 mb-3 text-sm">{error}</div>
        )}

        <button 
          className="border px-4 py-2 rounded disabled:opacity-50"
          onClick={handlePlaceOrder}
          disabled={placing}
        >
          {placing ? "Placing Order..." : "Place Order"}
        </button>
      </div>
    </div>
  );

  async function handlePlaceOrder() {
    if (!user) {
      navigate("/login");
      return;
    }

    setError("");
    setPlacing(true);

    try {
      const payload = {
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      };

      const res = await http.post("/api/orders", payload);
      const orderId = res.data._id;

      clearCart();
      navigate(`/orders/${orderId}`);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  }
}

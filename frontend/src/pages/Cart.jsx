import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectAuthUser } from "../store/authSlice";
import {
  clearCart,
  removeFromCart,
  selectCartItems,
  selectTotalPriceCents,
  updateQty,
} from "../store/cartSlice";
import { http } from "../api/http";

export default function Cart() {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const totalPriceCents = useSelector(selectTotalPriceCents);
  const user = useSelector(selectAuthUser);
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  if (items.length === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold">Your cart is empty</h1>
          <p className="text-sm text-gray-500 mt-2">
            Start adding premium gear to your cart.
          </p>
          <Link
            className="inline-block mt-4 rounded-xl border border-red-600 px-4 py-2 text-red-600 font-semibold"
            to="/products"
          >
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-4">Your Cart</h1>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {items.map((i) => (
              <div
                key={i.productId}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-lg flex flex-col"
              >
                <div className="font-semibold line-clamp-2 min-h-10">
                  {i.name}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  ${(i.priceCents / 100).toFixed(2)} each
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    className="h-8 w-8 rounded-full border border-gray-200 hover:border-red-600"
                    onClick={() =>
                      dispatch(updateQty({ productId: i.productId, quantity: i.quantity - 1 }))
                    }
                  >
                    -
                  </button>

                  <span className="min-w-8 text-center font-semibold">
                    {i.quantity}
                  </span>

                  <button
                    className="h-8 w-8 rounded-full border border-gray-200 hover:border-red-600"
                    onClick={() =>
                      dispatch(updateQty({ productId: i.productId, quantity: i.quantity + 1 }))
                    }
                  >
                    +
                  </button>
                </div>

                <div className="mt-3 text-sm text-gray-500">
                  Line total
                </div>
                <div className="font-semibold">
                  ${((i.priceCents * i.quantity) / 100).toFixed(2)}
                </div>

                <button
                  className="mt-auto text-sm text-red-600 hover:underline"
                  onClick={() => dispatch(removeFromCart(i.productId))}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-80 pt-12">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-lg sticky top-6">
            <h2 className="text-lg font-semibold">Order Summary</h2>
            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <span>Items</span>
              <span>{items.length}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
              <span>Total</span>
              <span className="font-semibold text-gray-900">
                ${(totalPriceCents / 100).toFixed(2)}
              </span>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              className="mt-5 w-full rounded-xl bg-red-600 px-4 py-2 text-white font-semibold hover:bg-red-700 disabled:opacity-60"
              onClick={handlePlaceOrder}
              disabled={placing}
            >
              {placing ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  async function handlePlaceOrder() {
    // Require login before placing an order.
    if (!user) {
      navigate("/login");
      return;
    }

    setError("");
    setPlacing(true);

    try {
      // Send only productId + quantity to keep payload minimal.
      const payload = {
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      };

      const res = await http.post("/api/orders", payload);
      const orderId = res.data._id;

      dispatch(clearCart());
      navigate(`/orders/${orderId}`);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  }
}

import { createSlice } from "@reduxjs/toolkit";

const CART_KEY = "cartItems";

// Load persisted cart items; fallback to empty on parse errors.
function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: loadCart(),
  },
  reducers: {
    // Add item or increment quantity.
    addToCart(state, action) {
      const product = action.payload;
      const existing = state.items.find((i) => i.productId === product._id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({
          productId: product._id,
          name: product.name,
          priceCents: product.priceCents,
          quantity: 1,
        });
      }
    },
    updateQty(state, action) {
      const { productId, quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter((i) => i.productId !== productId);
        return;
      }
      const item = state.items.find((i) => i.productId === productId);
      if (item) item.quantity = quantity;
    },
    removeFromCart(state, action) {
      state.items = state.items.filter((i) => i.productId !== action.payload);
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

export const { addToCart, updateQty, removeFromCart, clearCart } = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectTotalItems = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.quantity, 0);
export const selectTotalPriceCents = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.quantity * i.priceCents, 0);

export default cartSlice.reducer;

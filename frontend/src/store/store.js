import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import cartReducer from "./cartSlice";

// Global store for auth + cart state.
const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
  },
});

// Persist cart to localStorage so it survives refreshes.
store.subscribe(() => {
  const state = store.getState();
  try {
    localStorage.setItem("cartItems", JSON.stringify(state.cart.items));
  } catch {
    // ignore storage errors
  }
});

export default store;

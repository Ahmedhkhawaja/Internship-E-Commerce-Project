import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { http, setAuthToken } from "../api/http";

const TOKEN_KEY = "accessToken";
const initialToken = localStorage.getItem(TOKEN_KEY) || "";
// Initialize axios auth header from persisted token.
setAuthToken(initialToken);

// Fetch current user profile when a token exists.
export const fetchMe = createAsyncThunk("auth/fetchMe", async (_, { getState, rejectWithValue }) => {
  const { token } = getState().auth;
  if (!token) return null;
  try {
    const res = await http.get("/api/auth/me");
    return res.data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch user");
  }
});

// Login thunk persists token, then loads user profile.
export const loginUser = createAsyncThunk("auth/login", async ({ email, password }, { dispatch, rejectWithValue }) => {
  try {
    const res = await http.post("/api/auth/login", { email, password });
    const token = res.data?.accessToken || res.data?.token;
    if (!token) throw new Error("Auth response missing token");
    localStorage.setItem(TOKEN_KEY, token);
    setAuthToken(token);
    await dispatch(fetchMe());
    return token;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Login failed");
  }
});

// Register then immediately authenticate to set token + user.
export const registerUser = createAsyncThunk("auth/register", async ({ email, password }, { dispatch, rejectWithValue }) => {
  try {
    const res = await http.post("/api/auth/register", { email, password });
    const token = res.data?.accessToken || res.data?.token;
    if (!token) throw new Error("Auth response missing token");
    localStorage.setItem(TOKEN_KEY, token);
    setAuthToken(token);
    await dispatch(fetchMe());
    return token;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Register failed");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: initialToken,
    user: null,
    loading: Boolean(initialToken),
    error: "",
  },
  reducers: {
    // Clear all auth state on logout.
    logout(state) {
      localStorage.removeItem(TOKEN_KEY);
      setAuthToken("");
      state.token = "";
      state.user = null;
      state.loading = false;
      state.error = "";
    },
    clearAuthError(state) {
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null;
        state.token = "";
        state.loading = false;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.token = action.payload;
        state.loading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.payload || "Login failed";
        state.loading = false;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.token = action.payload;
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.error = action.payload || "Register failed";
        state.loading = false;
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;

export const selectAuthUser = (state) => state.auth.user;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthToken = (state) => state.auth.token;

export default authSlice.reducer;

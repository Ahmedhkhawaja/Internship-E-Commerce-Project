import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, selectAuthError } from "../store/authSlice";
import AuthCard from "../components/ui/AuthCard";
import TextInput from "../components/ui/TextInput";
import PrimaryButton from "../components/ui/PrimaryButton";

export default function Login() {
  const dispatch = useDispatch();
  const authError = useSelector(selectAuthError);
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      // Dispatch thunk to login, store token, and fetch user profile.
      await dispatch(loginUser({ email, password })).unwrap();
      // After login(), Redux stores token and loads /me.
      nav("/products");
    } catch (e) {
      setError(e?.message || authError || "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to manage your cart and orders."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextInput
          placeholder="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          rightElement={
            <button
              type="button"
              className="text-xs text-gray-500 hover:text-gray-900"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          }
        />

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <PrimaryButton disabled={submitting} type="submit">
          {submitting ? "Logging in..." : "Login"}
        </PrimaryButton>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        No account?{" "}
        <Link className="text-red-600 font-semibold" to="/register">
          Create one
        </Link>
      </p>
    </AuthCard>
  );
}
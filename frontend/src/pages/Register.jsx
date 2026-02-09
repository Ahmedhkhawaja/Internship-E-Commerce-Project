import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, selectAuthError } from "../store/authSlice";
import AuthCard from "../components/ui/AuthCard";
import TextInput from "../components/ui/TextInput";
import PrimaryButton from "../components/ui/PrimaryButton";

export default function Register() {
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
      // Register then redirect to login for a clean sign-in flow.
      await dispatch(registerUser({ email, password })).unwrap();
      nav("/login");
    } catch (e) {
      setError(e?.message || authError || "Register failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Create account"
      subtitle="Join and start building your cart."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextInput
          placeholder="Password (min 8)"
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
          {submitting ? "Creating..." : "Create account"}
        </PrimaryButton>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link className="text-red-600 font-semibold" to="/login">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}

"use client";
import '@/app/auth/css/loginAndRegister.css'
import { useState } from "react";
import { useRouter } from "next/navigation";
import ErrorAlert from "@/app/shared/components/ErrorAlert";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }
      // Store session (token) in localStorage or cookie
      if (data.session?.access_token) {
        localStorage.setItem("auth_token", data.session.access_token);
      }
      router.push("/my");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleRegister}>
      <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
      {error && <ErrorAlert message={error} onClose={() => setError("")} />}
      <div>
        <label className="block mb-1 font-medium">Email</label>
        <input
          type="email"
          className="input input-bordered w-full"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Password</label>
        <input
          type="password"
          className="input input-bordered w-full"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
      </div>
      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={loading}
      >
        {loading ? "Registering..." : "Register"}
      </button>
      <div className="text-center mt-4">
        <span>Already have an account? </span>
        <a href="/auth/login" className="link link-primary">Login</a>
      </div>
    </form>
  );
}

"use client";
import '@/app/auth/css/loginAndRegister.css'
import { useState, useEffect } from "react";
import api from "@/utils/axios/api";
import { useRouter } from "next/navigation";
import ErrorAlert from "@/app/shared/components/ErrorAlert";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("auth_token")) {
      router.replace("/my");
    }
  }, [router]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", { email, password });
      const data = res.data;
      if (data.session?.access_token) {
        localStorage.setItem("auth_token", data.session.access_token);
        localStorage.setItem("refresh_token", data.session.refresh_token || "");
      }
      router.replace("/my");
    } catch (err) {
      setError(`Something went wrong. Please try again. ${err}`);
    } finally {
      setLoading(false);
    }
  }

return (
    <form className="space-y-6" onSubmit={handleLogin}>
        <h2 className="text-2xl font-bold mb-4 text-center text-black header">Login</h2>
        {error && <ErrorAlert message={error} onClose={() => setError("")} />}
        <div>
            <label className="block mb-1 font-medium text-black">Email</label>
            <input
                type="email"
                className="input input-bordered w-full"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
            />
        </div>
        <div>
            <label className="block mb-1 font-medium text-black">Password</label>
            <input
                type="password"
                className="input input-bordered w-full text-black"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
            />
        </div>
        <button
            type="submit"
            className="submit-button w-full text-black"
            disabled={loading}
        >
            {loading ? "Logging in..." : "Login"}
        </button>
        <div className="text-center mt-4 text-black">
            <span>Don't have an account? </span>
            <a href="/auth/register" className="link link-primary text-black">Register</a>
        </div>
    </form>
);
}

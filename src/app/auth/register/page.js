"use client";
import '@/app/auth/css/loginAndRegister.css'
import { useState } from "react";
import { useRouter } from "next/navigation";
import ErrorAlert from "@/app/shared/components/ErrorAlert";
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
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
        body: JSON.stringify({ email, password, firstname, lastname, dateOfBirth }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }
      if (data.session?.access_token) {
        localStorage.setItem("auth_token", data.session.access_token);
        localStorage.setItem("refresh_token", data.session.refresh_token || "");
      }
      router.push("/my");
    } catch (err) {
      setError(`Something went wrong. Please try again. ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleRegister}>
      <h2 className="text-2xl font-bold mb-4 text-center text-black header">Register</h2>
      {error && <ErrorAlert message={error} onClose={() => setError("")} />}
      <div>
        <label className="block mb-1 font-medium text-black">First Name</label>
        <input
          type="text"
          className="input input-bordered w-full"
          value={firstname}
          onChange={e => setFirstname(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-medium text-black">Last Name</label>
        <input
          type="text"
          className="input input-bordered w-full"
          value={lastname}
          onChange={e => setLastname(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-medium text-black">Date of Birth</label>
        <input
          type="date"
          className="input input-bordered w-full"
          value={dateOfBirth}
          onChange={e => setDateOfBirth(e.target.value)}
          required
        />
      </div>
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
        {loading ? "Registering..." : "Register"}
      </button>
      <div className="text-center mt-4 text-black">
        <span>Already have an account? </span>
        <Link href="/auth/login" className="link link-primary text-black">Login</Link>
      </div>
    </form>
  );
}

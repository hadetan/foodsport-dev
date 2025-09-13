"use client";
import '@/app/[locale]/auth/css/loginAndRegister.css'
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ErrorAlert from "@/app/shared/components/ErrorAlert";
import Link from 'next/link';
import { useAuth } from '@/app/shared/contexts/authContext';
import { getSupabaseClient } from '@/lib/supabase';
import toast from '@/utils/Toast';
import api from '@/utils/axios/api';

export default function RegisterPage() {
  const supabase = getSupabaseClient();
  const [email, setEmail] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { signup, authToken } = useAuth();
  const subOnce = useRef(false);
  const handledOnce = useRef(false);

  useEffect(() => {
      if (typeof window !== "undefined" && authToken) {
        router.replace("/my");
      }
    }, [router]);

  useEffect(() => {
    if (subOnce.current) return;
    subOnce.current = true;
    const { data: subscription } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session?.access_token) return;
      await handleSession(session);
    });
    return () => subscription?.subscription?.unsubscribe?.();
  }, [supabase]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session && !handledOnce.current) {
        await handleSession(data.session);
      }
    })();
  }, [supabase]);

  const handleSession = async (session) => {
    if (handledOnce.current) return;
    handledOnce.current = true;
    try {
      await api.post('/auth/sync-session', { access_token: session.access_token, refresh_token: session.refresh_token });
      try { localStorage.setItem('auth_token', session.access_token); } catch {}
      const res = await api.post('/auth/pre-profile');
      const data = res.data || {};
      if (data.reason === 'email_exists') {
        toast.info('Account with this email already exists. Please login and link Google in settings.');
        try { localStorage.removeItem('auth_token'); } catch {}
        try { await api.delete('/auth/logout'); } catch {}
        try {
          await Promise.race([
            supabase.auth.signOut({ scope: 'local' }).catch(() => {}),
            new Promise((resolve) => setTimeout(resolve, 750)),
          ]);
        } catch {}
        router.replace('/auth/login');
        return;
      }
      if (data.created || (data.existing && data.userExists)) {
        window.location.href = '/my';
        return;
      }
      if (data.preProfile) {
        window.location.href = '/auth/onboard';
        return;
      }
    } catch (e) {
      console.error(e);
      handledOnce.current = false;
    }
  };

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signup({ email, password, firstname, lastname, dateOfBirth })
      router.push("/my");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const onGoogle = async () => {
    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/auth/register`;
      await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div className="">
      <div className="w-full max-w-md p-6 bg-base-100 rounded">
        <h1 className="text-2xl font-semibold mb-4 text-center">Register</h1>
        <form className="space-y-6" onSubmit={handleRegister}>
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
        </form>
        <button onClick={onGoogle} disabled={loading} className="btn btn-outline w-full mt-4">
          Continue with Google
        </button>
        <div className="mt-4 text-sm text-center">
          Already have an account? <Link href="/auth/login" className="link">Login</Link>
        </div>
      </div>
    </div>
  );
}

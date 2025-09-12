"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { notifyError, notifySuccess } from "@/lib/notify";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || undefined, email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Registration failed");
      }
      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (signInRes?.ok) {
        notifySuccess("Account created and signed in");
        router.push("/");
      } else {
        notifySuccess("Account created. Please sign in");
        router.push("/auth/login");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Registration failed";
      setError(message);
      notifyError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-slate-950 p-6 rounded border border-slate-800 space-y-3"
      >
        <div className="text-center text-xl font-semibold">Create account</div>
        <input
          type="text"
          placeholder="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
          minLength={6}
          required
        />
        {error && <div className="text-sm text-red-400">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-medium rounded px-3 py-2 disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create account"}
        </button>
        <div className="text-center text-sm opacity-80">
          Have an account?{" "}
          <Link href="/auth/login" className="text-yellow-400 hover:underline">
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
}

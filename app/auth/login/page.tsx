"use client";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { notifyError, notifySuccess } from "@/lib/notify";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AuthLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.ok) {
      notifySuccess("Signed in successfully");
      router.push("/");
    } else {
      setError("Invalid email or password");
      notifyError("Sign in failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-slate-950 p-6 rounded border border-slate-800 space-y-3">
        <div className="text-center text-xl font-semibold">Sign in</div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
        />
        {error && <div className="text-sm text-red-400">{error}</div>}
        <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-medium rounded px-3 py-2">
          Sign in
        </button>
        <div className="text-center text-sm opacity-80">
          New here?{" "}
          <Link href="/register" className="text-yellow-400 hover:underline">
            Create an account
          </Link>
        </div>
      </form>
    </div>
  );
}

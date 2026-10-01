"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "./auth.api";
import { useAuth } from "./useAuth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
export function LoginForm() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { authenticate } = useAuth();
  const router = useRouter();
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(e.currentTarget);
    const identity = String(data.get("identity")).trim();
    try {
      authenticate(
        await login({
          password: String(data.get("password")),
          ...(identity.includes("@")
            ? { email: identity }
            : { phone: identity }),
        }),
      );
      router.push("/templates");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="auth-form">
      <span className="eyebrow">আপনার পোস্টারের শুরু এখানে</span>
      <h1>স্বাগতম, আবারও</h1>
      <p>আপনার অ্যাকাউন্টে লগ ইন করুন।</p>
      <Input
        label="ইমেইল অথবা ফোন নম্বর"
        name="identity"
        required
        autoComplete="username"
      />
      <Input
        label="পাসওয়ার্ড"
        name="password"
        type="password"
        required
        minLength={1}
        maxLength={72}
        autoComplete="current-password"
      />
      {error && <Toast message={error} />}
      <Button disabled={busy} type="submit">
        {busy ? "অপেক্ষা করুন…" : "লগ ইন করুন"} →
      </Button>
      <p className="auth-switch">
        নতুন এখানে? <Link href="/register">নিবন্ধন করুন</Link>
      </p>
    </form>
  );
}

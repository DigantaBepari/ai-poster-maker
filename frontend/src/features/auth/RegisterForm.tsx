"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register } from "./auth.api";
import { useAuth } from "./useAuth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
export function RegisterForm() {
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
        await register({
          name: String(data.get("name")),
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
      <h1>নতুন অ্যাকাউন্ট তৈরি করুন</h1>
      <p>নিজের পরিচয়কে দিন নতুন রূপ।</p>
      <Input
        label="আপনার নাম"
        name="name"
        required
        minLength={2}
        maxLength={100}
        autoComplete="name"
      />
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
        minLength={8}
        maxLength={72}
        autoComplete="new-password"
      />
      {error && <Toast message={error} />}
      <Button disabled={busy} type="submit">
        {busy ? "অপেক্ষা করুন…" : "অ্যাকাউন্ট তৈরি করুন"} →
      </Button>
      <p className="auth-switch">
        অ্যাকাউন্ট আছে? <Link href="/login">লগ ইন</Link>
      </p>
    </form>
  );
}

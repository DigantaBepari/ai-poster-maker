"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/useAuth";
export function Navbar() {
  const { user, logout } = useAuth();
  const path = usePathname();
  return (
    <header className="navbar">
      <Link href="/" className="brand">
        <span className="brand-icon">প</span>
        <span>
          পোস্টার<span className="brand-ai"> AI</span>
        </span>
      </Link>
      <nav aria-label="Main navigation">
        <Link
          className={path === "/templates" ? "active" : ""}
          href="/templates"
        >
          টেমপ্লেট
        </Link>
        {user ? (
          <>
            <Link
              className={path.startsWith("/posters") ? "active" : ""}
              href="/posters"
            >
              আমার পোস্টার
            </Link>
            <button onClick={logout} className="nav-logout">
              লগ আউট
            </button>
          </>
        ) : (
          <Link href="/login">লগ ইন ↗</Link>
        )}
      </nav>
    </header>
  );
}

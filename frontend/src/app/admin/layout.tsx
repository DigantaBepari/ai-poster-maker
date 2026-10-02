import type { ReactNode } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { Navbar } from "@/components/layout/Navbar";
import { AdminRoute } from "@/features/admin/AdminRoute";
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <Navbar />
      <main className="workspace">
        <AdminRoute>
          <nav className="admin-nav" aria-label="অ্যাডমিন বিভাগ">
            <Link href="/admin/templates">টেমপ্লেট ব্যবস্থাপনা</Link>
            <Link href="/admin/posters">পোস্টার পর্যালোচনা</Link>
          </nav>
          {children}
        </AdminRoute>
      </main>
    </ProtectedRoute>
  );
}

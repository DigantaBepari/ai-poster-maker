"use client";
import type { ReactNode } from "react";
import { useAuth } from "@/features/auth/useAuth";
import { EmptyState } from "@/components/ui/EmptyState";
export function AdminRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return user?.role === "admin" ? (
    children
  ) : (
    <EmptyState
      title="প্রবেশাধিকার নেই"
      description="এই পৃষ্ঠা শুধু অ্যাডমিনের জন্য।"
    />
  );
}

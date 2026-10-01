import type { Metadata } from "next";
import { Noto_Sans_Bengali } from "next/font/google";
import { AuthProvider } from "@/features/auth/AuthContext";
import "./globals.css";
const bengali = Noto_Sans_Bengali({
  subsets: ["bengali", "latin"],
  display: "swap",
  variable: "--font-bengali",
});
export const metadata: Metadata = {
  title: "পোস্টার AI | AI Political Poster Maker",
  description: "বাংলায় রাজনৈতিক ও সামাজিক পোস্টারের সহজ শুরু",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <body className={bengali.variable}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

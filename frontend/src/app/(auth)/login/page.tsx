import { LoginForm } from "@/features/auth/LoginForm";
import { Navbar } from "@/components/layout/Navbar";
export default function Page() {
  return (
    <>
      <Navbar />
      <main className="auth-page">
        <aside className="auth-art">
          <span className="eyebrow">পোস্টার AI</span>
          <h2>
            আপনার বার্তা।
            <br />
            সবার কাছে।
          </h2>
          <p>
            বাংলায় সুন্দর পোস্টারের জন্য
            <br />
            একটি সহজ শুরু।
          </p>
          <div className="auth-orbit" />
        </aside>
        <LoginForm />
      </main>
    </>
  );
}

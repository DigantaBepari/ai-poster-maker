import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="badge">
              <span /> বাংলায় ডিজাইন, সহজেই
            </div>
            <h1>
              আপনার বার্তা,
              <br />
              <span>সুন্দর পোস্টারে।</span>
            </h1>
            <p>
              বিজয়ের আনন্দ থেকে শ্রদ্ধার স্মরণ — প্রতিটি উপলক্ষে
              <br className="desktop" /> আপনার পরিচয়, আপনার ভাষায়।
            </p>
            <div className="hero-actions">
              <Link href="/register" className="button">
                শুরু করুন <span>↗</span>
              </Link>
              <Link href="/templates" className="text-link">
                টেমপ্লেট দেখুন →
              </Link>
            </div>
            <div className="hero-note">
              <span>✦</span> বাংলা টাইপোগ্রাফি <span>·</span> আপনার ছবি{" "}
              <span>·</span> নিজস্ব পরিচয়
            </div>
          </div>
          <div className="hero-gallery">
            <div className="gallery-label">
              ডিজাইনে থাকুক আপনার কথা <span>✦</span>
            </div>
            <div className="poster-stack">
              <Image
                className="hero-poster back"
                src="/templates/condolence.svg"
                alt="শোক ও স্মরণ পোস্টারের নমুনা"
                width={800}
                height={1000}
                priority
              />
              <Image
                className="hero-poster front"
                src="/templates/victory-day.svg"
                alt="বিজয় দিবসের পোস্টারের নমুনা"
                width={800}
                height={1000}
                priority
              />
              <div className="floating-label">
                <span>✦</span> বাংলার রঙে, আপনার পরিচয়
              </div>
            </div>
            <div className="gallery-bottom">
              উপলক্ষ আলাদা। অনুভূতি আপনার। <span>01 / 03</span>
            </div>
          </div>
        </section>
        <section className="occasion-strip">
          <span>প্রতিটি উপলক্ষে</span>
          <div>
            বিজয় দিবস <b>✳</b> শোক ও স্মরণ <b>✳</b> নির্বাচনী প্রচার <b>✳</b>{" "}
            শুভেচ্ছা <b>✳</b> ঈদ ও উৎসব
          </div>
        </section>
        <section className="how-section">
          <div>
            <span className="eyebrow">সহজ তিনটি ধাপ</span>
            <h2>ভাবনা থেকে পোস্টার।</h2>
            <p>আপনার বার্তাকে সাজিয়ে তোলার সহজ পথ।</p>
          </div>
          <div className="steps">
            {[
              [
                "01",
                "টেমপ্লেট বেছে নিন",
                "উপলক্ষের সঙ্গে মানানসই একটি ডিজাইন।",
              ],
              [
                "02",
                "নিজের তথ্য যোগ করুন",
                "নাম, পরিচয়, ছবি আর আপনার বার্তা।",
              ],
              [
                "03",
                "পোস্টার তৈরি করুন",
                "তৈরি ও ডাউনলোডের সুবিধা শীঘ্রই আসছে।",
              ],
            ].map(([n, t, d]) => (
              <article key={n}>
                <span>{n}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

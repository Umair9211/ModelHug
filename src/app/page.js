"use client";
import Link from "next/link";
import { useNav } from "./context/NavContext";

export default function Home() {
  const { navCategories } = useNav();
  const allModels = navCategories.flatMap((c) => c.items);

  return (
    <div className="home-page">
      {/* ── Hero ── */}
      <section className="hp-hero">
        <div className="hp-glow" />
        <h1 className="hp-title">
          The community platform for <span className="hp-accent">AI models</span>
        </h1>
        <p className="hp-sub">
          Explore, test and interact with open-source AI — right in your browser.
        </p>
        <div className="hp-ctas">
          <Link href="/models/text-and-chat/text-generation" className="hp-btn-primary">
            Get started
          </Link>
          <Link href="/models/vision/image-gen" className="hp-btn-ghost">
            Try image gen →
          </Link>
        </div>
      </section>

      {/* ── Quick links grid ── */}
      <section className="hp-grid">
        {allModels.map((m) => (
          <Link key={m.name} href={m.href} className="hp-card">
            <span className="hp-card-icon">{m.icon}</span>
            <span className="hp-card-name">{m.name}</span>
          </Link>
        ))}
      </section>
    </div>
  );
}

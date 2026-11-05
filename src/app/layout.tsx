import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { getProfile } from "@/lib/content";
import { ThemeToggle } from "@/components/theme-toggle";

const base = process.env.SITE_BASE_PATH ?? "";
export const metadata: Metadata = {
  metadataBase: new URL(process.env.PUBLIC_SITE_URL ?? "https://andersontavares0.github.io"),
  title: { default: "Infrastructure work, documented — Anderson Tavares", template: "%s — Anderson Tavares" },
  description: "Documented infrastructure work: decisions, boundaries, evidence and the limits of what was observed.",
  openGraph: { type: "website", title: "Infrastructure work, documented", description: "Documented infrastructure decisions and evidence." },
  other: { "page-type": "software", "site-kind": "software" }
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const profile = await getProfile();
  return <html lang="en" data-type="software" data-radius="soft" data-buttons="solid" data-motion><body><a className="skip-link" href="#main">Skip to content</a><header className="site-header"><div className="wrap nav"><Link className="brand" href="/"><span className="brand-mark" aria-hidden="true">AT</span><span>Anderson Tavares</span></Link><nav className="nav-links" aria-label="Main navigation"><Link href="/cases/">Case studies</Link><Link className="nav-service-map" href="/#service-map">Service map</Link><Link href="/profile/">Profile</Link><a className="nav-github" href={profile.data.github} target="_blank" rel="noreferrer">GitHub <ArrowIcon/></a><ThemeToggle /></nav></div></header><main id="main">{children}</main><footer className="footer"><div className="wrap footer-inner"><Link className="brand" href="/"><span className="brand-mark" aria-hidden="true">AT</span><span>Anderson Tavares</span></Link><span>Documented infrastructure work · Not live status</span><a href={profile.data.github} target="_blank" rel="noreferrer">GitHub <ArrowIcon/></a></div></footer></body></html>;
}

function ArrowIcon(){return <svg aria-hidden="true" viewBox="0 0 16 16"><path d="M3 13 13 3M4 3h9v9" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>}

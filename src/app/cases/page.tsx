import type { Metadata } from "next";
import Link from "next/link";
import { getCases } from "@/lib/content";
export const metadata: Metadata = { title: "Case studies" };
export default async function CasesPage() {
  const cases = await getCases();
  return <section className="wrap reading">
    <p className="eyeline">PROJECT RECORDS / 05 STUDIES</p>
    <h1>Case studies</h1>
    <p className="lead">Problems, decisions, evidence—and the limits of what was demonstrated.</p>
    <div className="project-list">{cases.map((item, index) => <Link className="project" href={`/cases/${item.id}/`} key={item.id}>
      <span className="project-index">0{index + 1}</span>
      <div className="project-title"><h3>{item.title}</h3><small>{item.phase ?? "Infrastructure"} · {item.minutes} min read</small></div>
      <p>{item.summary}</p><span className="project-arrow" aria-hidden="true">↗</span>
    </Link>)}</div>
  </section>;
}

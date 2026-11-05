import type { Metadata } from "next";
import { getProfile, getCases } from "@/lib/content";
import Link from "next/link";
export const metadata: Metadata={title:"Professional summary"};
export default async function ProfilePage() {
  const [profile, cases] = await Promise.all([getProfile(), getCases()]);
  return <article className="wrap reading">
    <p className="eyeline">PROFILE / INFRASTRUCTURE</p>
    <h1>{profile.data.name}</h1>
    <p className="lead">{profile.data.description}</p>
    <h2>Technical areas</h2>
    <ul className="skill-list">{profile.data.skills.map((skill: string) => <li key={skill}>{skill}</li>)}</ul>
    <h2>Project experience</h2>
    {cases.map(item => <p key={item.id}><Link href={`/cases/${item.id}/`}>{item.title}</Link> — {item.summary}</p>)}
    <p><a href={profile.data.github} target="_blank" rel="noreferrer">View GitHub profile ↗</a></p>
  </article>;
}

import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { getCases, getProfile } from "@/lib/content";
import { ServiceMap } from "@/components/service-map";

export default async function HomePage() {
  const [cases, profile] = await Promise.all([getCases(), getProfile()]);
  return <>
    <section className="wrap hero" id="top" aria-labelledby="home-title">
      <div className="hero-copy"><p className="eyeline"><span className="eyeline-mark"/>Independent infrastructure portfolio</p><h1 id="home-title">Infrastructure<br/>work, <span>documented.</span></h1><p className="hero-lead">{profile.data.description}</p><div className="hero-actions"><Link className="button button-primary" href="/cases/">Read the case studies <ArrowUpRight aria-hidden="true" size={18}/></Link><Link className="text-link" href="#service-map">View service relationships <ArrowDownRight aria-hidden="true" size={17}/></Link></div></div>
      <div className="hero-visual" aria-label="Documented infrastructure work">
        <div className="visual-top"><span>Infrastructure record</span><span className="visual-index">01 / 05</span></div>
        <div className="hero-art">
          <div className="art-rail"><span>Observe</span><i/><span>Decide</span><i/><span>Verify</span></div>
          <div className="art-card art-card-main"><small>CASE STUDY / ALERT DELIVERY</small><strong>One relay owns<br/>the destination credential.</strong><div className="art-flow"><span>CrowdSec</span><b>→</b><span>Relay</span><b>→</b><span>Telegram</span></div></div>
           <div className="art-coordinate">DECISIONS / EVIDENCE / LIMITS</div>
        </div>
         <div className="visual-bottom"><span>Not live traffic · Evidence before claims</span><span>Linux · Virtualization · Operations</span></div>
      </div>
       <a className="hero-scroll" href="#work">Scroll to the work <span aria-hidden="true">↓</span></a>
    </section>

    <section id="work" className="section work-section" aria-labelledby="work-title"><div className="wrap">
      <div className="section-head"><div><p className="eyeline">01 / Case studies</p><h2 id="work-title">Infrastructure decisions</h2></div><p>Five studies record constraints, choices, observations, and what remains unproven.</p></div>
      <div className="project-list">{cases.map((item,index)=><Link className="project" href={`/cases/${item.id}/`} key={item.id}><span className="project-index">0{index+1}</span><div className="project-title"><h3>{item.title}</h3><small>{item.phase ?? "Infrastructure"} · {item.minutes} min read</small></div><p>{item.summary}</p><ArrowUpRight className="project-arrow" aria-hidden="true" size={20}/></Link>)}</div>
      <div className="section-foot"><span>Each record separates observed behavior from assumptions.</span><Link className="text-link" href="/cases/">All case studies <ArrowUpRight aria-hidden="true" size={16}/></Link></div>
    </div></section>

    <section id="service-map" className="section map-section" aria-labelledby="map-title"><div className="wrap">
      <div className="section-head"><div><p className="eyeline">02 / System view</p><h2 id="map-title">Service relationships</h2></div><p>Documented services and evidence-backed links; this map does not report current health.</p></div>
      <div className="map-frame"><ServiceMap /></div>
    </div></section>

    <section id="profile" className="section profile-section" aria-labelledby="profile-title"><div className="wrap profile-grid">
      <div><p className="eyeline">03 / Professional summary</p><h2 id="profile-title">Technical practice, grounded in evidence.</h2></div>
      <div className="profile-copy"><p>{profile.content}</p><ul className="skill-list">{profile.data.skills.map((skill:string)=><li key={skill}>{skill}</li>)}</ul><Link className="button button-primary" href="/profile/">Read the professional summary <ArrowUpRight aria-hidden="true" size={18}/></Link></div>
    </div></section>
  </>;
}

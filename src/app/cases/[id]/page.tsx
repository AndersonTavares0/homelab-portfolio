import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { compile, run } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { getCases, getCase } from "@/lib/content";

export const dynamicParams = false;
export async function generateStaticParams() { return (await getCases()).map(item=>({id:item.id})); }
export async function generateMetadata({params}:{params:Promise<{id:string}>}):Promise<Metadata>{const {id}=await params; const item=await getCase(id); return item?{title:item.title,description:item.summary}:{};}
export default async function CasePage({params}:{params:Promise<{id:string}>}) { const {id}=await params; const item=await getCase(id); if(!item) notFound(); const compiled=await compile(item.markdown,{outputFormat:"function-body"}); const {default:Content}=await run(String(compiled),runtime); return <article className="wrap reading"><Link href="/cases/">← All case studies</Link><p className="eyeline">{item.phase ?? "Infrastructure"} / {item.minutes} MIN READ</p><h1>{item.title}</h1><p className="lead">{item.summary}</p><div className="case-meta">{item.technologies.map((tech:string)=><span key={tech}>{tech}</span>)}</div><div className="reading-content"><Content components={mdxComponents}/></div><section className="documented-state"><h2>Documented state</h2><p>{item.documentedState}</p></section></article>; }
const mdxComponents={a:(props:any)=><a {...props}/>,h2:(props:any)=><h2 {...props}/>,h3:(props:any)=><h3 {...props}/>};

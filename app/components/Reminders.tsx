import React, {useState} from "react";
import {CheckIcon, ArrowUpRightIcon, ArrowLeftIcon} from "lucide-react";
import type {DragHandleProps} from "./MacWindow";
import {MeetingBooking} from "./MeetingBooking";

const steps = [
  {id:"intro",title:"Watch Intro",detail:"Start with a quick hello"},
  {id:"about",title:"About Me",detail:"Get to know the designer"},
  {id:"projects",title:"Explore Projects",detail:"See all selected work"},
  {id:"case:Trust Bank",title:"Trust Bank Case Study",detail:"Fintech and banking"},
  {id:"case:GameCove",title:"GameCove Case Study",detail:"Product thinking and execution"},
  {id:"case:UTrada",title:"UTrada Case Study",detail:"End-to-end design"},
  {id:"case:ETO Markets",title:"ETO Markets Case Study",detail:"Trading and finance"},
  {id:"cv",title:"View CV",detail:"Experience and skills"},
  {id:"meeting",title:"Book a Meeting",detail:"Let's connect · final step"}
];

export function Reminders({dragHandleProps, lights, onNavigate}:{
 dragHandleProps:DragHandleProps; lights:React.ReactNode; onNavigate:(step:string)=>void;
}) {
 const [done,setDone]=useState<string[]>(()=>{
   try {const raw=sessionStorage.getItem("harbor.portfolio.checklist"); return raw?JSON.parse(raw):[];} catch{return [];}
 });
 const [booking,setBooking]=useState(false);
 const toggle=(id:string)=>{
  setDone(current=>{const next=current.includes(id)?current.filter(x=>x!==id):[...current,id];try{sessionStorage.setItem("harbor.portfolio.checklist",JSON.stringify(next));}catch{}return next;});
 };
 if(booking) return <div className="flex h-full flex-col bg-white">
   <button type="button" onClick={()=>setBooking(false)} className="absolute right-4 top-3 z-10 flex items-center gap-1 rounded-md bg-white/90 px-2 py-1 text-xs shadow"><ArrowLeftIcon size={13}/> Checklist</button>
   <MeetingBooking dragHandleProps={dragHandleProps} lights={lights}/>
 </div>;
 return <div className="flex h-full flex-col bg-white text-black/85">
   <div {...dragHandleProps} className="flex h-[52px] shrink-0 items-center gap-3 border-b border-black/5 px-4">{lights}<span className="ml-auto text-[12px] text-black/40">Portfolio Guide</span></div>
   <div className="min-h-0 flex-1 overflow-auto px-5 pb-5">
     <h1 className="mt-5 text-[27px] font-bold tracking-tight text-[#ff453a]">Explore Harbor</h1>
     <p className="mt-2 text-[12px] leading-5 text-black/55">A little checklist for your visit. Explore at your own pace and tick off what you've seen.</p>
     <div className="mt-4 flex items-center justify-between text-[12px] font-medium"><span>Portfolio progress</span><span>{done.length} / {steps.length} completed</span></div>
     <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/10"><div className="h-full rounded-full bg-[#ff453a] transition-all" style={{width:`${done.length/steps.length*100}%`}}/></div>
     <ul className="mt-5 divide-y divide-black/[0.07]">
       {steps.map((step,i)=><li key={step.id} className="flex items-center gap-3 py-3">
         <button type="button" aria-label={`Mark ${step.title} ${done.includes(step.id)?"incomplete":"complete"}`} aria-pressed={done.includes(step.id)} onClick={()=>toggle(step.id)} className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] ${done.includes(step.id)?"border-[#ff453a] bg-[#ff453a] text-white":"border-black/30 hover:border-[#ff453a]"}`}>{done.includes(step.id)&&<CheckIcon size={12} strokeWidth={3}/>}</button>
         <button type="button" onClick={()=>step.id==="meeting"?setBooking(true):onNavigate(step.id)} className="flex min-w-0 flex-1 items-center justify-between gap-2 text-left">
           <span className="min-w-0"><span className={`block text-[13px] font-medium ${done.includes(step.id)?"text-black/40 line-through":""}`}><span className="mr-2 text-black/35">{String(i+1).padStart(2,"0")}</span>{step.title}</span><span className="mt-1 block text-[11px] text-black/40">{step.detail}</span></span>
           <ArrowUpRightIcon size={16} className="shrink-0 text-black/35"/>
         </button>
       </li>)}
     </ul>
     <p className="pt-4 text-[11px] text-black/40">Your progress is saved for this browsing session.</p>
   </div>
 </div>;
}

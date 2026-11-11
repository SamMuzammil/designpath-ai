import {NextResponse} from 'next/server';
import OpenAI from 'openai';
import {owner,sameOrigin} from '../../../lib/server';
export const runtime='nodejs';
export async function POST(request:Request){
 const auth=await owner();if(!auth)return NextResponse.json({error:'Sign-in required'},{status:401});
 if(!sameOrigin(request))return NextResponse.json({error:'Origin rejected'},{status:403});
 if(!process.env.OPENAI_API_KEY)return NextResponse.json({error:'Configure OPENAI_API_KEY in Render.'},{status:503});
 let body:Record<string,unknown>;try{body=await request.json()}catch{return NextResponse.json({error:'Invalid JSON'},{status:400})}
 const problem=typeof body.problem==='string'?body.problem.trim().slice(0,4000):'';
 const decisions=typeof body.decisions==='string'?body.decisions.trim().slice(0,4000):'';
 const figma=typeof body.figma==='string'?body.figma.slice(0,400):'';
 if(!problem||!decisions)return NextResponse.json({error:'Add a problem statement and design decisions first.'},{status:400});
 try{
 const openai=new OpenAI({apiKey:process.env.OPENAI_API_KEY,timeout:30000,maxRetries:1});
 const r=await openai.responses.create({model:process.env.OPENAI_MODEL||'gpt-4.1-mini',store:false,max_output_tokens:1000,
 instructions:'You are a strict but constructive Product Design mentor. Grade ONLY visible text evidence, under the Day 1 rubric: problem understanding /20, user flow /20, usability /25, UI/Figma /20, design reasoning /15. If no flow/screens actually provided, mark their categories NOT ASSESSED, NOT ZERO, and do not give a misleading total out of 100. The pasted Figma URL itself is not visual evidence. Give text-based feedback, high-priority improvements, and what screenshot/link to submit for full scoring. Do not claim you inspected external links or images.',
 input:`Problem statement: ${problem}\nDecisions: ${decisions}\nFigma link (NOT OPENED): ${figma}`});
 return NextResponse.json({review:r.output_text||'No review generated.'});
 }catch(error){console.error('Review error:',error instanceof Error?error.message:'unknown');return NextResponse.json({error:'AI review unavailable; check API settings.'},{status:502})}
}

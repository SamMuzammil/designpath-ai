import {NextResponse} from 'next/server';
import OpenAI from 'openai';
import {owner,sameOrigin} from '../../../lib/server';
export const runtime='nodejs';export const dynamic='force-dynamic';
const rate=new Map<string,number[]>();
export async function GET(){
 const auth=await owner();if(!auth)return NextResponse.json({error:'Sign-in required'},{status:401});
 const {data,error}=await auth.db.from('chat_messages').select('role,content,created_at').eq('user_id',auth.user.id).order('created_at',{ascending:false}).limit(40);
 if(error)return NextResponse.json({error:'Database schema missing'},{status:503});
 return NextResponse.json({messages:(data||[]).reverse()},{headers:{'cache-control':'no-store'}});
}
export async function POST(request:Request){
 const auth=await owner();if(!auth)return NextResponse.json({error:'Sign-in required'},{status:401});
 if(!sameOrigin(request))return NextResponse.json({error:'Origin rejected'},{status:403});
 if(!process.env.OPENAI_API_KEY)return NextResponse.json({error:'OpenAI API key is not configured in Render yet.'},{status:503});
 let body:Record<string,unknown>;try{body=await request.json()}catch{return NextResponse.json({error:'Invalid JSON'},{status:400})}
 const question=typeof body.message==='string'?body.message.trim():'';
 if(question.length<1||question.length>3000)return NextResponse.json({error:'Message must be 1–3,000 characters'},{status:400});
 const now=Date.now();const hits=(rate.get(auth.user.id)||[]).filter(t=>now-t<60000);
 if(hits.length>=8)return NextResponse.json({error:'Please allow a minute before more messages.'},{status:429});
 hits.push(now);rate.set(auth.user.id,hits);
 const {data:past,error:readError}=await auth.db.from('chat_messages').select('role,content').eq('user_id',auth.user.id).order('created_at',{ascending:false}).limit(12);
 if(readError)return NextResponse.json({error:'Chat table missing'},{status:503});
 try{
 const openai=new OpenAI({apiKey:process.env.OPENAI_API_KEY,timeout:25000,maxRetries:1});
 const context=(past||[]).reverse().filter(x=>x.role==='user'||x.role==='assistant').map(x=>({role:x.role as 'user'|'assistant',content:x.content as string}));
 const result=await openai.responses.create({model:process.env.OPENAI_MODEL||'gpt-4.1-mini',store:false,max_output_tokens:850,
 instructions:'You are DesignPath AI, a practical personal mentor preparing a designer in Bengaluru for Product Designer roles with a target salary of ₹12–16 LPA (never promise outcomes). Learner has basic Figma, new to UX, 5–7 hours per week, graphic design and HTML/CSS/React knowledge, operations experience at an arts academy. Give lessons, concrete assignments, feedback, Figma instructions, interview practice. Never fake usability testing, portfolio outcomes, hiring rates, or assessment of unseen design screens. Emphasize UX research, product thinking, design systems, accessibility, measurable decisions. Be succinct but teach thoroughly. Encourage independent work.',
 input:[...context,{role:'user',content:question}]});
 const reply=result.output_text?.trim();if(!reply)throw Error('Empty model reply');
 const {error:writeError}=await auth.db.from('chat_messages').insert([{user_id:auth.user.id,role:'user',content:question},{user_id:auth.user.id,role:'assistant',content:reply}]);
 if(writeError)throw Error('Unable to persist conversation');
 return NextResponse.json({reply});
 }catch(error){console.error('Tutor error:',error instanceof Error?error.message:'unknown');return NextResponse.json({error:'Tutor request failed. Verify your model/API usage and Render logs.'},{status:502})}
}

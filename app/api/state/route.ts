import {NextResponse} from 'next/server';
import {owner,sameOrigin} from '../../../lib/server';
export const dynamic='force-dynamic';
export async function GET(){
 const auth=await owner();if(!auth)return NextResponse.json({error:'Sign-in required'},{status:401});
 const {data,error}=await auth.db.from('learning_state').select('data,updated_at').eq('user_id',auth.user.id).maybeSingle();
 if(error)return NextResponse.json({error:'Database not initialized; run schema.sql'},{status:503});
 return NextResponse.json({state:data?.data||{},updatedAt:data?.updated_at||null},{headers:{'cache-control':'no-store'}});
}
export async function PUT(request:Request){
 const auth=await owner();if(!auth)return NextResponse.json({error:'Sign-in required'},{status:401});
 if(!sameOrigin(request))return NextResponse.json({error:'Origin rejected'},{status:403});
 const raw=await request.text();if(raw.length>100000)return NextResponse.json({error:'State too large'},{status:413});
 let state:unknown;try{state=JSON.parse(raw)}catch{return NextResponse.json({error:'Invalid JSON'},{status:400})}
 if(!state||typeof state!=='object'||Array.isArray(state))return NextResponse.json({error:'Expected object'},{status:400});
 const {error}=await auth.db.from('learning_state').upsert({user_id:auth.user.id,data:state,updated_at:new Date().toISOString()},{onConflict:'user_id'});
 if(error)return NextResponse.json({error:'Unable to save progress; database schema may be missing'},{status:500});
 return NextResponse.json({ok:true});
}

import {NextResponse} from 'next/server';
import {serverClient,isConfigured,sameOrigin} from '../../../lib/server';
export const dynamic='force-dynamic';
export async function POST(request:Request){
 if(!isConfigured())return NextResponse.json({error:'Database not configured'},{status:503});
 if(!sameOrigin(request))return NextResponse.json({error:'Origin not allowed'},{status:403});
 let body:Record<string,unknown>;
 try{body=await request.json()}catch{return NextResponse.json({error:'Invalid body'},{status:400})}
 const email=typeof body.email==='string'?body.email.trim().toLowerCase():'';
 const password=typeof body.password==='string'?body.password:'';
 if(email!==process.env.PRIVATE_EMAIL?.trim().toLowerCase()||password.length<6||password.length>1024)return NextResponse.json({error:'Invalid credentials'},{status:401});
 const db=await serverClient();
 const {error,data}=await db.auth.signInWithPassword({email,password});
 if(error||!data.user||data.user.email?.toLowerCase()!==email){await db.auth.signOut();return NextResponse.json({error:'Invalid credentials'},{status:401})}
 return NextResponse.json({ok:true});
}
export async function DELETE(request:Request){
 if(!sameOrigin(request))return NextResponse.json({error:'Origin not allowed'},{status:403});
 if(isConfigured()){const db=await serverClient();await db.auth.signOut()}
 return NextResponse.json({ok:true});
}

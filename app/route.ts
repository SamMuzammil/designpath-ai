import {NextResponse} from 'next/server';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {owner,isConfigured} from '../lib/server';
export const runtime='nodejs';export const dynamic='force-dynamic';
const setup=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DesignPath AI — Setup</title><style>body{margin:0;background:#14172a;color:#f7f5ff;font:16px system-ui;display:grid;min-height:100vh;place-items:center}.card{background:#252943;border:1px solid #494d68;border-radius:20px;max-width:580px;padding:36px;margin:22px}h1{font-size:32px}p,li{line-height:1.7;color:#d2d0e7}code{color:#c8b3ff}a{color:#cdbdff}</style><div class="card"><p>✦ DESIGNPATH AI</p><h1>Private studio setup</h1><p>Your application is deployed. Activate Supabase credentials and your owner email in Render to enable secure sign-in, saved progress, and the AI tutor.</p><ol><li>Create a Supabase project and run <code>supabase/schema.sql</code>.</li><li>Add <code>NEXT_PUBLIC_SUPABASE_URL</code>, <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>, and <code>PRIVATE_EMAIL</code> in Render.</li><li>Enable/create your email login in Supabase Authentication.</li><li>Add <code>OPENAI_API_KEY</code> in Render for live tutoring.</li></ol><p>Until configured, explore the separate <a href="https://designpath-ai-preview.onrender.com">public interface preview</a>.</p></div></html>`;
export async function GET(request:Request){
 if(!isConfigured())return new NextResponse(setup,{headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store'}});
 const auth=await owner();
 if(!auth)return NextResponse.redirect(new URL('/login',request.url));
 const html=await readFile(join(process.cwd(),'index.html'),'utf8');
 const changed=html.replace('</body>','<script defer src="/enhance.js"></script></body>')
 .replace('DesignPath AI — Interface Preview','DesignPath AI — My Learning Studio')
 .replace('Interface preview:','Private learning studio:')
 .replace('Preview only · live AI requires API credential','Live AI coaching · private learning studio');
 return new NextResponse(changed,{headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
}

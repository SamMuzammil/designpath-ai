import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
export const isConfigured=()=>Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY&&process.env.PRIVATE_EMAIL);
export async function serverClient(){
  if(!isConfigured()) throw new Error('Supabase configuration required');
  const store=await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,{
    cookies:{getAll(){return store.getAll()},setAll(items: { name: string; value: string; options?: Parameters<typeof store.set>[2] }[]){for(const item of items){try{store.set(item.name,item.value,item.options)}catch{/* rendering context */}}}}
  });
}
export async function owner(){
  if(!isConfigured()) return null;
  const db=await serverClient(); const {data:{user},error}=await db.auth.getUser();
  const allowed=process.env.PRIVATE_EMAIL?.trim().toLowerCase();
  if(error||!user||!user.email||user.email.toLowerCase()!==allowed)return null;
  return {db,user};
}
export function sameOrigin(request:Request){
  const origin=request.headers.get('origin');
  return !origin||origin===new URL(request.url).origin;
}

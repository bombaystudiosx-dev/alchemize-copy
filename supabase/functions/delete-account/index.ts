// supabase/functions/delete-account/index.ts
// Replaces: base44/functions/deleteAccount/entry.ts
// Deploy: supabase functions deploy delete-account
// Secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type'};
serve(async(req)=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
  try{
    const sb=createClient(Deno.env.get('SUPABASE_URL')??'',Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')??'');
    const token=(req.headers.get('Authorization')??'').replace('Bearer ','');
    const{data:{user},error}=await sb.auth.getUser(token);
    if(error||!user)throw new Error('Unauthorized');
    // Delete all user data from app tables before deleting auth user
    // TODO: add table cleanup here, e.g.: await sb.from('profiles').delete().eq('id', user.id)
    const{error:deleteError}=await sb.auth.admin.deleteUser(user.id);
    if(deleteError)throw deleteError;
    return new Response(JSON.stringify({success:true}),{headers:{...cors,'Content-Type':'application/json'}});
  }catch(err){
    return new Response(JSON.stringify({error:err.message}),{status:400,headers:{...cors,'Content-Type':'application/json'}});
  }
});

// supabase/functions/verify-session/index.ts
// Replaces: base44/functions/verifySession/entry.ts
// Deploy: supabase functions deploy verify-session
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
          if(error||!user)return new Response(JSON.stringify({valid:false,error:'Invalid session'}),{status:401,headers:{...cors,'Content-Type':'application/json'}});
          return new Response(JSON.stringify({valid:true,user:{id:user.id,email:user.email,metadata:user.user_metadata}}),{headers:{...cors,'Content-Type':'application/json'}});
        }catch(err){
          return new Response(JSON.stringify({valid:false,error:err.message}),{status:400,headers:{...cors,'Content-Type':'application/json'}});
        }
  });

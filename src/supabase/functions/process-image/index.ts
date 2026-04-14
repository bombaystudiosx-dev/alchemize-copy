// supabase/functions/process-image/index.ts
// Replaces: base44/functions/processImage/entry.ts
// Deploy: supabase functions deploy process-image
// Secrets: OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type'};
serve(async(req)=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
  try{
    const{imageUrl,prompt,operation='describe'}=await req.json();
    const openaiKey=Deno.env.get('OPENAI_API_KEY');
    if(!openaiKey)throw new Error('OPENAI_API_KEY not configured');
    let result;
    if(operation==='generate'){
      // Image generation via DALL-E
      const res=await fetch('https://api.openai.com/v1/images/generations',{
        method:'POST',
        headers:{'Authorization':`Bearer ${openaiKey}`,'Content-Type':'application/json'},
        body:JSON.stringify({model:'dall-e-3',prompt,n:1,size:'1024x1024'})
      });
      const data=await res.json();
      result={url:data.data?.[0]?.url};
    }else{
      // Vision - describe image
      const res=await fetch('https://api.openai.com/v1/chat/completions',{
        method:'POST',
        headers:{'Authorization':`Bearer ${openaiKey}`,'Content-Type':'application/json'},
        body:JSON.stringify({model:'gpt-4o-mini',messages:[{role:'user',content:[{type:'text',text:prompt||'Describe this image'},{type:'image_url',image_url:{url:imageUrl}}]}]})
      });
      const data=await res.json();
      result={description:data.choices?.[0]?.message?.content};
    }
    return new Response(JSON.stringify(result),{headers:{...cors,'Content-Type':'application/json'}});
  }catch(err){
    return new Response(JSON.stringify({error:err.message}),{status:400,headers:{...cors,'Content-Type':'application/json'}});
  }
});

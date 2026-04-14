// supabase/functions/restore-purchase/index.ts
// Replaces: base44/functions/restorePurchase/entry.ts
// Deploy: supabase functions deploy restore-purchase
// Secrets: STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
import Stripe from 'https://esm.sh/stripe@14?target=deno';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')??'', {apiVersion:'2023-10-16',httpClient:Stripe.createFetchHttpClient()});
const cors = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type'};
serve(async (req) => {
    if (req.method==='OPTIONS') return new Response('ok', {headers:cors});
    try {
          const sb=createClient(Deno.env.get('SUPABASE_URL')??'',Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')??'');
          const token=(req.headers.get('Authorization')??'').replace('Bearer ','');
          const {data:{user},error}=await sb.auth.getUser(token);
          if (error||!user) throw new Error('Unauthorized');
          const customers=await stripe.customers.list({email:user.email,limit:1});
          if (!customers.data.length) throw new Error('No Stripe customer found');
          const customerId=customers.data[0].id;
          const subs=await stripe.subscriptions.list({customer:customerId,status:'active',limit:10});
          const isActive=subs.data.length>0;
          await sb.auth.admin.updateUserById(user.id,{user_metadata:{subscription_active:isActive,stripe_customer_id:customerId}});
          return new Response(JSON.stringify({restored:isActive}),{headers:{...cors,'Content-Type':'application/json'}});
        } catch(err) {
          return new Response(JSON.stringify({error:err.message}),{status:400,headers:{...cors,'Content-Type':'application/json'}});
        }
  });

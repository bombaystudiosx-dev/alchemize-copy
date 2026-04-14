// supabase/functions/stripe-webhook/index.ts
// Replaces: base44/functions/stripeWebhook/entry.ts
// Deploy: supabase functions deploy stripe-webhook
// Secrets: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
import Stripe from 'https://esm.sh/stripe@14?target=deno';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const stripe=new Stripe(Deno.env.get('STRIPE_SECRET_KEY')??'',{apiVersion:'2023-10-16',httpClient:Stripe.createFetchHttpClient()});
serve(async(req)=>{
    const sig=req.headers.get('stripe-signature')??'';
    const body=await req.text();
    let event;
    try {
          event=stripe.webhooks.constructEvent(body,sig,Deno.env.get('STRIPE_WEBHOOK_SECRET')??'');
        } catch(err){
          return new Response(`Webhook Error: ${err.message}`,{status:400});
        }
    const sb=createClient(Deno.env.get('SUPABASE_URL')??'',Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')??'');
    switch(event.type){
            case 'checkout.session.completed':{
                    const session=event.data.object;
                    const userId=session.metadata?.user_id;
                    if(userId){
                              await sb.auth.admin.updateUserById(userId,{user_metadata:{subscription_active:true,stripe_customer_id:session.customer}});
                            }
                    break;
                  }
            case 'customer.subscription.deleted':{
                    // TODO: mark user subscription inactive
              break;
                  }
          }
    return new Response(JSON.stringify({received:true}),{headers:{'Content-Type':'application/json'}});
  });

/**
 * supabase/functions/create-checkout/index.ts
 *
 * Replaces: base44/functions/createCheckout/entry.ts
 *
 * Creates a Stripe Checkout session for subscription payments.
 * Deploy with: supabase functions deploy create-checkout
 *
 * Required secrets (set with `supabase secrets set`):
 *   STRIPE_SECRET_KEY
 *   STRIPE_PRICE_ID
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import Stripe from 'https://esm.sh/stripe@14?target=deno';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { priceId, successUrl, cancelUrl } = await req.json();

    // Get the user from the Supabase auth header
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error('Unauthorized');

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId ?? Deno.env.get('STRIPE_PRICE_ID'), quantity: 1 }],
      success_url: successUrl ?? `${req.headers.get('origin')}/success`,
      cancel_url: cancelUrl ?? `${req.headers.get('origin')}/`,
      customer_email: user.email,
      metadata: { user_id: user.id },
    });

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.7.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stripeCustomerId = user.stripe_customer_id;
    if (!stripeCustomerId) {
      return Response.json({ error: 'No subscription found' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || req.headers.get('referer') || '';

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: origin,
    });

    console.log('Portal session created for:', user.email);
    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Portal session error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
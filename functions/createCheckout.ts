import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.7.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

const PRICES = {
  monthly: 'price_1T31mwAqYthC9sOwUqQZL0wn',
  semiannual: 'price_1T31mwAqYthC9sOw0XdCBvxx',
  annual: 'price_1T31mwAqYthC9sOwi3fnOJXD',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { plan } = await req.json();

    const priceId = PRICES[plan];
    if (!priceId) {
      return Response.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Try to get user email for pre-fill, but don't require auth
    let customerEmail;
    try {
      const user = await base44.auth.me();
      customerEmail = user?.email;
    } catch (e) {
      // No authenticated user, that's fine
    }

    const origin = req.headers.get('origin') || req.headers.get('referer') || '';

    const sessionConfig = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}?checkout=success`,
      cancel_url: `${origin}?checkout=cancel`,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        plan,
      },
    };

    // Add 7-day free trial for monthly plan
    if (plan === 'monthly') {
      sessionConfig.subscription_data = {
        trial_period_days: 7,
        metadata: { base44_app_id: Deno.env.get("BASE44_APP_ID"), plan },
      };
    }

    if (customerEmail) {
      sessionConfig.customer_email = customerEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log('Checkout session created:', session.id, 'plan:', plan);
    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
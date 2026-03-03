import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.7.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

const PRICES = {
  monthly: Deno.env.get("STRIPE_MONTHLY_PRICE_ID")
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { plan = 'monthly' } = await req.json();

    const priceId = PRICES[plan] || PRICES['monthly'];
    if (!priceId) {
      return Response.json({ error: 'Stripe price ID not configured. Please set STRIPE_MONTHLY_PRICE_ID.' }, { status: 500 });
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

    // Build proper success/cancel URLs
    const baseUrl = origin.replace(/\/$/, '');
    const successUrl = `${baseUrl}/Home?checkout=success`;
    const cancelUrl = `${baseUrl}/Premium?checkout=cancel`;

    const sessionConfig = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        plan,
        user_email: customerEmail || '',
      },
    };

    // Add 7-day free trial
    sessionConfig.subscription_data = {
      trial_period_days: 3,
      metadata: { base44_app_id: Deno.env.get("BASE44_APP_ID"), plan },
    };

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
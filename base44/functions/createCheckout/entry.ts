import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
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
      return Response.json({ error: 'Stripe price ID not configured.' }, { status: 500 });
    }

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Redirect to billing portal if already subscribed
    if (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing' || user.stripeCustomerId) {
        if (user.stripeCustomerId) {
            const portalSession = await stripe.billingPortal.sessions.create({
                customer: user.stripeCustomerId,
                return_url: req.headers.get('origin') + '/Home',
            });
            console.log('Redirecting to portal for user:', user.id);
            return Response.json({ url: portalSession.url });
        }
    }

    const origin = req.headers.get('origin') || req.headers.get('referer') || 'https://alchemize.com';
    const baseUrl = origin.replace(/\/$/, '');
    
    const successUrl = `${baseUrl}/Home?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/Premium?checkout=cancel`;

    const sessionConfig = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: user.id,
      customer_email: user.email,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        plan,
        userId: user.id
      },
      subscription_data: {
        trial_period_days: 3,
        metadata: { base44_app_id: Deno.env.get("BASE44_APP_ID"), plan, userId: user.id },
      }
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);
    console.log('Checkout session created:', session.id);
    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
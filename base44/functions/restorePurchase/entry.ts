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

    // Search for customer by email in Stripe
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      return Response.json({ found: false, message: 'No purchase found for this account.' });
    }

    const customer = customers.data[0];

    // Check for active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1,
    });

    const trialSubs = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'trialing',
      limit: 1,
    });

    const activeSub = subscriptions.data[0] || trialSubs.data[0];

    if (activeSub) {
      await base44.asServiceRole.entities.User.update(user.id, {
        subscription_status: activeSub.status,
        stripe_customer_id: customer.id,
        subscription_plan: activeSub.metadata?.plan || 'restored',
      });
      console.log('Purchase restored for:', user.email, 'status:', activeSub.status);
      return Response.json({ found: true, status: activeSub.status });
    }

    return Response.json({ found: false, message: 'No active subscription found.' });
  } catch (error) {
    console.error('Restore purchase error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
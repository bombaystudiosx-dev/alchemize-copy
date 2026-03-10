import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.7.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('Stripe event received:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.client_reference_id || session.metadata?.userId;
        console.log('Checkout completed:', session.id, 'userId:', userId);
        
        if (userId) {
          try {
            await base44.asServiceRole.entities.User.update(userId, {
              subscriptionStatus: 'active',
              stripeCustomerId: session.customer,
              planName: session.metadata?.plan || 'monthly',
              accessLevel: 'Pro',
              billingStatus: 'paid'
            });
            console.log('User subscription activated for ID:', userId);
          } catch (e) {
            console.error('Error updating user on checkout:', e.message);
          }
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const status = subscription.status;
        const plan = subscription.items?.data?.[0]?.price?.nickname || subscription.items?.data?.[0]?.price?.id || 'monthly';
        const customerId = subscription.customer;
        const trialStart = subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null;
        const trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null;
        
        try {
          const customer = await stripe.customers.retrieve(customerId);
          const email = customer.email;
          if (email) {
            const users = await base44.asServiceRole.entities.User.filter({ email });
            if (users.length > 0) {
              const user = users[0];
              await base44.asServiceRole.entities.User.update(user.id, {
                subscriptionStatus: status,
                stripeCustomerId: customerId,
                stripeSubscriptionId: subscription.id,
                planName: plan,
                trialStartDate: trialStart,
                trialEndDate: trialEnd,
                billingStatus: status === 'past_due' ? 'failed' : 'active',
                accessLevel: (status === 'active' || status === 'trialing') ? 'Pro' : 'Free'
              });
              console.log('User subscription updated:', email, 'status:', status);
            }
          }
        } catch (e) {
          console.error('Error updating user subscription:', e.message);
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        try {
          const customerId = subscription.customer;
          const customer = await stripe.customers.retrieve(customerId);
          if (customer.email) {
            const users = await base44.asServiceRole.entities.User.filter({ email: customer.email });
            if (users.length > 0) {
              await base44.asServiceRole.entities.User.update(users[0].id, {
                subscriptionStatus: 'cancelled',
                stripeSubscriptionId: subscription.id,
                billingStatus: 'cancelled',
                accessLevel: 'Free'
              });
              console.log('User subscription cancelled:', customer.email);
            }
          }
        } catch (e) {
          console.error('Error cancelling user subscription:', e.message);
        }
        break;
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
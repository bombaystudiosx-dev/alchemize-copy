import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.7.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { session_id } = await req.json();
    if (!session_id) return Response.json({ error: 'Missing session_id' }, { status: 400 });

    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['subscription']
    });

    if (session.payment_status === 'paid' || session.status === 'complete') {
        const userId = session.client_reference_id || session.metadata?.userId;
        if (userId === user.id) {
            const subscription = session.subscription;
            let status = 'active';
            let trialStart = null;
            let trialEnd = null;
            if (subscription && typeof subscription !== 'string') {
                status = subscription.status;
                trialStart = subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null;
                trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null;
            }

            await base44.asServiceRole.entities.User.update(userId, {
                subscriptionStatus: status,
                stripeCustomerId: session.customer,
                stripeSubscriptionId: typeof subscription === 'string' ? subscription : subscription?.id,
                planName: session.metadata?.plan || 'monthly',
                trialStartDate: trialStart,
                trialEndDate: trialEnd,
                billingStatus: 'paid',
                accessLevel: 'Pro'
            });
            console.log('Verified and activated subscription for:', userId);
            return Response.json({ success: true, accessLevel: 'Pro' });
        }
    }
    return Response.json({ success: false });
  } catch (error) {
    console.error('Verify session error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
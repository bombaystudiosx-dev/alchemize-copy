import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
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
        const email = session.customer_email || session.customer_details?.email;
        console.log('Checkout completed:', session.id, 'email:', email);
        
        if (email) {
          try {
            const users = await base44.asServiceRole.entities.User.filter({ email });
            if (users.length > 0) {
              await base44.asServiceRole.entities.User.update(users[0].id, {
                subscription_status: 'active',
                stripe_customer_id: session.customer,
                subscription_plan: session.metadata?.plan || 'unknown',
              });
              console.log('User subscription activated for:', email);
            }
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
        console.log('Subscription event:', event.type, 'status:', status);
        
        try {
          const customerId = subscription.customer;
          const customer = await stripe.customers.retrieve(customerId);
          const email = customer.email;
          if (email) {
            const users = await base44.asServiceRole.entities.User.filter({ email });
            if (users.length > 0) {
              const plan = subscription.items?.data?.[0]?.price?.nickname || 
                           subscription.items?.data?.[0]?.price?.id || 'unknown';
              const periodEnd = subscription.current_period_end
                ? new Date(subscription.current_period_end * 1000).toISOString()
                : null;
              await base44.asServiceRole.entities.User.update(users[0].id, {
                subscription_status: status,
                stripe_customer_id: customerId,
                stripe_subscription_id: subscription.id,
                subscription_plan: plan,
                subscription_period_end: periodEnd,
              });
              console.log('User subscription updated:', email, 'status:', status, 'plan:', plan);
            }
          }
        } catch (e) {
          console.error('Error updating user subscription:', e.message);
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log('Subscription cancelled:', subscription.id);
        
        try {
          const customerId = subscription.customer;
          const customer = await stripe.customers.retrieve(customerId);
          const email = customer.email;
          if (email) {
            const users = await base44.asServiceRole.entities.User.filter({ email });
            if (users.length > 0) {
              await base44.asServiceRole.entities.User.update(users[0].id, {
                subscription_status: 'cancelled',
                stripe_subscription_id: subscription.id,
                subscription_period_end: subscription.current_period_end
                  ? new Date(subscription.current_period_end * 1000).toISOString()
                  : null,
              });
              console.log('User subscription cancelled:', email);
            }
          }
        } catch (e) {
          console.error('Error cancelling user subscription:', e.message);
        }
        break;
      }
      case 'invoice.paid': {
        const invoice = event.data.object;
        const customerId = invoice.customer;
        console.log('Invoice paid:', invoice.id, 'amount:', invoice.amount_paid);
        try {
          const customer = await stripe.customers.retrieve(customerId);
          const email = customer.email;
          if (email) {
            const users = await base44.asServiceRole.entities.User.filter({ email });
            if (users.length > 0) {
              await base44.asServiceRole.entities.User.update(users[0].id, {
                subscription_status: 'active',
                stripe_customer_id: customerId,
              });
              console.log('Invoice paid, subscription kept active for:', email);
            }
          }
        } catch (e) {
          console.error('Error handling invoice.paid:', e.message);
        }
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.log('Invoice payment failed:', invoice.id);
        try {
          const customer = await stripe.customers.retrieve(invoice.customer);
          const email = customer.email;
          if (email) {
            const users = await base44.asServiceRole.entities.User.filter({ email });
            if (users.length > 0) {
              await base44.asServiceRole.entities.User.update(users[0].id, {
                subscription_status: 'past_due',
              });
              console.log('User marked past_due due to failed payment:', email);
            }
          }
        } catch (e) {
          console.error('Error handling invoice.payment_failed:', e.message);
        }
        break;
      }
      default:
        console.log('Unhandled event type:', event.type);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
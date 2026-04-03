// Stripe portal disabled - app is free
Deno.serve(async (req) => {
  return Response.json({ disabled: true, message: 'Billing portal is disabled. All features are free.' }, { status: 200 });
});

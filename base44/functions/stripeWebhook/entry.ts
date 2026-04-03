// Stripe webhook disabled - app is free, no payment events to process
Deno.serve(async (req) => {
  return Response.json({ disabled: true, message: 'Stripe webhook is disabled. App is free.' }, { status: 200 });
});

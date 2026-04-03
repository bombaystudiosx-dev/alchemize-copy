// Stripe checkout disabled - app is free
Deno.serve(async (req) => {
  return Response.json({ disabled: true, message: 'Payments are disabled. All features are free.' }, { status: 200 });
});

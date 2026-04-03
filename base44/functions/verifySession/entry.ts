// Verify session disabled - app is free, no subscription verification needed
Deno.serve(async (req) => {
  return Response.json({ disabled: true, success: true, message: 'All features are free. No verification needed.' }, { status: 200 });
});

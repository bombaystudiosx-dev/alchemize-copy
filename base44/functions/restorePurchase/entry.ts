// Restore purchase disabled - app is free, no purchases to restore
Deno.serve(async (req) => {
  return Response.json({ disabled: true, found: false, message: 'No purchases to restore. All features are free.' }, { status: 200 });
});

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = user.email;

    // Delete all user data across all entities using service role
    const entityNames = [
      'HabitProgress', 'ManifestationTile', 'Affirmation', 'Goal',
      'GratitudeEntry', 'JournalEntry', 'FoodLog', 'SavedFood',
      'NutritionGoal', 'BodyMetrics', 'MealPlan', 'Workout',
      'Habit', 'FinancialIncome', 'FinancialExpense', 'FinancialNote',
      'FinanceNote', 'Transaction', 'TodoItem', 'Appointment',
      'UploadedImage'
    ];

    // Delete all records for this user across all entities
    for (const entityName of entityNames) {
      try {
        const records = await base44.asServiceRole.entities[entityName].filter({ created_by: userEmail });
        for (const record of records) {
          await base44.asServiceRole.entities[entityName].delete(record.id);
        }
      } catch (e) {
        // Entity may not exist or have no records — continue
        console.log(`Skipping ${entityName}: ${e.message}`);
      }
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error('Delete account error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
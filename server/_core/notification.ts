/**
 * System notification helper
 */

export async function notifyOwner(payload: { title: string; content: string }) {
  // Placeholder - route to email/slack/webhook in production
  console.log('[system.notifyOwner]', payload.title, payload.content);
  return true;
}

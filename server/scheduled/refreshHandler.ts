/**
 * Scheduled Refresh Handler
 * Handles weekly automatic refresh of dashboard data
 * Called via /api/scheduled/refresh endpoint
 */

import { Request, Response } from 'express';
import { sdk } from '../_core/sdk';
import { refreshAllSectors } from '../scheduler/refresher';
import { notifyRefreshCompletion } from '../notifications/owner';

export async function handleScheduledRefresh(req: Request, res: Response) {
  try {
    // Authenticate as cron request
    const user = await sdk.authenticateRequest(req);
    
    if (!user || !('isCron' in user) || !(user as any).isCron) {
      return res.status(403).json({ 
        error: 'cron-only',
        message: 'This endpoint is only accessible via scheduled cron jobs'
      });
    }

    const taskUid = (user as any).taskUid || 'unknown';
    console.log(`[Scheduled Refresh] Starting weekly refresh (taskUid: ${taskUid})`);

    // Run refresh for all sectors
    const results = await refreshAllSectors();

    // Log results
    const successCount = results.filter(r => r.status === 'completed').length;
    const failureCount = results.filter(r => r.status === 'failed').length;

    console.log(`[Scheduled Refresh] Completed: ${successCount} sectors succeeded, ${failureCount} failed`);

    // Send summary notification
    const summary = results.map(r => ({
      sector: r.sector,
      status: r.status,
      documentsChecked: r.documentsChecked,
      newDocumentsFound: r.newDocumentsFound,
      errorCount: r.errors.length,
    }));

    // Notify owner of completion
    try {
      await notifyRefreshCompletion('all', 
        results.reduce((sum, r) => sum + r.documentsChecked, 0),
        results.reduce((sum, r) => sum + r.newDocumentsFound, 0),
        results.flatMap(r => r.errors)
      );
    } catch (notifyError) {
      console.error('[Scheduled Refresh] Failed to send notification:', notifyError);
    }

    // Return success response
    res.json({
      ok: true,
      message: 'Weekly refresh completed successfully',
      summary,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    // Log error with context
    const errorMsg = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : '';
    
    console.error('[Scheduled Refresh] Error:', errorMsg, stack);

    // Return error response in the format Manus expects
    res.status(500).json({
      error: errorMsg,
      stack,
      context: {
        url: req.url,
        taskUid: 'unknown',
      },
      timestamp: new Date().toISOString(),
    });
  }
}

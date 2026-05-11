/**
 * Owner Notifications System
 * Sends notifications to platform owner for important events
 */

import { notifyOwner } from '../_core/notification';

export interface NotificationPayload {
  title: string;
  content: string;
}

/**
 * Notify owner of refresh completion
 */
export async function notifyRefreshCompletion(
  sector: string,
  documentsChecked: number,
  newDocumentsFound: number,
  errors: string[]
): Promise<boolean> {
  try {
    const errorSummary = errors.length > 0 ? `\n\nErrors encountered: ${errors.slice(0, 3).join(', ')}${errors.length > 3 ? '...' : ''}` : '';
    
    const content = `Refresh completed for ${sector} sector.\n\nDocuments checked: ${documentsChecked}\nNew documents found: ${newDocumentsFound}${errorSummary}`;
    
    return await notifyOwner({
      title: `Refresh Complete: ${sector}`,
      content,
    });
  } catch (error) {
    console.error('[Notifications] Error notifying refresh completion:', error);
    return false;
  }
}

/**
 * Notify owner of new document ingestion
 */
export async function notifyNewDocuments(
  sector: string,
  company: string,
  documentCount: number,
  documentTypes: string[]
): Promise<boolean> {
  try {
    const content = `New documents ingested for ${company} (${sector} sector).\n\nCount: ${documentCount}\nTypes: ${documentTypes.join(', ')}`;
    
    return await notifyOwner({
      title: `New Documents: ${company}`,
      content,
    });
  } catch (error) {
    console.error('[Notifications] Error notifying new documents:', error);
    return false;
  }
}

/**
 * Notify owner of critical fetch failures
 */
export async function notifyCriticalFailure(
  sector: string,
  failedCompanies: string[],
  errorMessage: string
): Promise<boolean> {
  try {
    const content = `Critical failures during ${sector} sector refresh.\n\nFailed companies: ${failedCompanies.join(', ')}\n\nError: ${errorMessage}`;
    
    return await notifyOwner({
      title: `Critical Failure: ${sector}`,
      content,
    });
  } catch (error) {
    console.error('[Notifications] Error notifying critical failure:', error);
    return false;
  }
}

/**
 * Notify owner of synthesis generation completion
 */
export async function notifySynthesisGenerated(
  sector: string,
  period: string
): Promise<boolean> {
  try {
    const content = `Synthesis generated for ${sector} sector (${period}).\n\nCheck the dashboard to view sector narrative and investing lens insights.`;
    
    return await notifyOwner({
      title: `Synthesis Generated: ${sector}`,
      content,
    });
  } catch (error) {
    console.error('[Notifications] Error notifying synthesis generation:', error);
    return false;
  }
}

/**
 * Notify owner of metrics extraction completion
 */
export async function notifyMetricsExtracted(
  sector: string,
  company: string,
  metricsCount: number
): Promise<boolean> {
  try {
    const content = `Metrics extracted for ${company} (${sector} sector).\n\nMetrics extracted: ${metricsCount}`;
    
    return await notifyOwner({
      title: `Metrics Extracted: ${company}`,
      content,
    });
  } catch (error) {
    console.error('[Notifications] Error notifying metrics extraction:', error);
    return false;
  }
}

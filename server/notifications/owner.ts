/**
 * Owner notifications (simple implementations)
 */

export async function notifyRefreshCompletion(sector: string, documentsChecked: number, newDocumentsFound: number, errors: string[] = []) {
  console.log(`[notify] Refresh completed for ${sector}: checked=${documentsChecked}, new=${newDocumentsFound}, errors=${errors.length}`);
  return true;
}

export async function notifyCriticalFailure(sector: string, failedCompanies: string[], errorMessage: string) {
  console.error(`[notify] Critical failure for ${sector}: companies=${failedCompanies.join(', ')} error=${errorMessage}`);
  return true;
}

export async function notifySynthesisGenerated(sector: string, period: string) {
  console.log(`[notify] Synthesis generated for ${sector} (${period})`);
  return true;
}

import { RecurringPatternCluster, DomainType } from '../types';
import { getDatabase } from '../store';

export async function detectRecurringPatterns(domain?: DomainType): Promise<RecurringPatternCluster[]> {
  const db = getDatabase();
  let patterns = db.recurringPatterns;
  if (domain) {
    patterns = patterns.filter(p => p.domain === domain);
  }

  const domainIssues = domain ? db.issues.filter(i => i.domain === domain) : db.issues;
  
  const clusters = new Map<string, typeof domainIssues>();
  for (const issue of domainIssues) {
    const key = `${issue.domain}_${issue.category}_${issue.location.toLowerCase()}`;
    if (!clusters.has(key)) {
      clusters.set(key, []);
    }
    clusters.get(key)!.push(issue);
  }

  return patterns;
}

export function generatePatternHypothesis(issuesCount: number, asset: string, location: string, patternType: string): { hypothesis: string; recommendation: string } {
  if (patternType === 'TEMPORAL_CYCLE') {
    return {
      hypothesis: `Load surge during recurring peak hours exceeds throughput capacity for ${asset} at ${location}.`,
      recommendation: `Upgrade capacity or redistribute load balance to prevent cyclic outages.`
    };
  } else if (patternType === 'WEATHER_CORRELATED') {
    return {
      hypothesis: `Precipitation and drainage backpressure is degrading sub-structural foundation around ${location}.`,
      recommendation: `Inspect underground drainage joints and waterproof foundation before further surface work.`
    };
  } else {
    return {
      hypothesis: `Component wear and accelerated thermal degradation observed across ${asset}.`,
      recommendation: `Conduct full preventative overhaul and replace wear-and-tear consumables.`
    };
  }
}

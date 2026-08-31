export type DomainType = 'civic' | 'campus' | 'enterprise';

export type IssueStatus = 
  | 'REPORTED'
  | 'TRIAGED'
  | 'IN_PROGRESS'
  | 'PENDING_VERIFICATION'
  | 'VERIFIED_CLOSED'
  | 'VERIFICATION_FAILED';

export type IssuePriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface TimelineEvent {
  id: string;
  stage: 'REPORT' | 'TRIAGE' | 'ROUTING' | 'ACTION_CLAIM' | 'AI_VERIFICATION' | 'IMPACT_LOGGED' | 'REOPENED';
  title: string;
  description: string;
  actor: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface VerificationEvidence {
  beforeImageUrl?: string;
  beforeNotes?: string;
  afterImageUrl?: string;
  afterNotes?: string;
  submittedBy?: string;
  submittedAt?: string;
}

export interface AIAdjudicationResult {
  status: 'VERIFIED_SUCCESSFUL' | 'VERIFICATION_FAILED_REOPENED' | 'NEEDS_MANUAL_AUDIT';
  confidence: number; // 0 to 100
  summary: string;
  visualComparisonScore: number; // 0 to 100
  keyFindings: string[];
  rootCauseResolved: boolean;
  anomalyDetected: boolean;
  timestamp: string;
  modelUsed: string;
  impactScoreDelta: number;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  domain: DomainType;
  category: string;
  department: string;
  priority: IssuePriority;
  asset: string;
  location: string;
  status: IssueStatus;
  reportedBy: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  verifiedAt?: string;
  assignedTo?: string;
  evidence: VerificationEvidence;
  adjudication?: AIAdjudicationResult;
  timeline: TimelineEvent[];
  duplicateOfId?: string;
  linkedDuplicates?: string[];
  recurringClusterId?: string;
  claimedBy?: string;
  slaHours: number;
}

export interface DepartmentMetric {
  department: string;
  domain: DomainType;
  problemsAssigned: number;
  claimedResolutions: number;
  verifiedResolutions: number;
  failedVerifications: number;
  avgResolutionDays: number;
  verifiedResolutionRate: number; // percentage (0-100)
  impactScore: number; // composite 0-100
  slaComplianceRate: number; // percentage (0-100)
  activeRecurringIssues: number;
}

export interface RecurringPatternCluster {
  id: string;
  domain: DomainType;
  title: string;
  category: string;
  asset: string;
  location: string;
  frequencyCount: number;
  timeframe: string;
  patternType: 'TEMPORAL_CYCLE' | 'LOCATION_HOTSPOT' | 'ASSET_DEGRADATION' | 'WEATHER_CORRELATED';
  rootCauseHypothesis: string;
  aiRecommendation: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  issueIds: string[];
  lastOccurrence: string;
}

export interface AITriageRequest {
  title: string;
  description: string;
  domain: DomainType;
  imageUrl?: string;
}

export interface AITriageResponse {
  category: string;
  department: string;
  priority: IssuePriority;
  asset: string;
  location: string;
  summary: string;
  confidence: number;
  potentialDuplicates: Array<{
    id: string;
    title: string;
    similarity: number;
    status: IssueStatus;
    location: string;
  }>;
}

export interface AIQueryRequest {
  query: string;
  domain?: DomainType;
}

export interface AIQueryResponse {
  answer: string;
  keyInsights: string[];
  suggestedActions: string[];
  relevantIssueIds: string[];
  chartData?: {
    label: string;
    value: number;
  }[];
}

import fs from 'fs';
import path from 'path';
import { Issue, DepartmentMetric, RecurringPatternCluster, DomainType } from './types';
import { connectToDatabase, IssueModel, RecurringPatternModel } from './db/mongodb';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export interface DatabaseSchema {
  issues: Issue[];
  recurringPatterns: RecurringPatternCluster[];
  lastUpdated: string;
}

const DEFAULT_ISSUES: Issue[] = [
  // --- 1. UNIVERSITY CAMPUS DOMAIN ---
  {
    id: 'CAMPUS-101',
    title: 'Lab 3 Wi-Fi drops repeatedly during peak class hours',
    description: 'Wi-Fi connection continuously disconnects in Computer Lab 3 every Monday between 10:00 AM and 1:00 PM. High student packet loss.',
    domain: 'campus',
    category: 'IT & Network',
    department: 'IT Infrastructure',
    priority: 'HIGH',
    asset: 'Cisco AP-9120 Access Point #3',
    location: 'Science Block, Lab 3, 2nd Floor',
    status: 'IN_PROGRESS',
    reportedBy: 'Prof. Sharma (CS Dept)',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    assignedTo: 'Alex Mercer (Network Engineer)',
    slaHours: 48,
    recurringClusterId: 'CLUSTER-CAMPUS-01',
    evidence: {
      beforeImageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
      beforeNotes: 'Packet loss exceeds 45%. Access point beacon dropping channels under 60-client concurrent load.',
    },
    timeline: [
      {
        id: 't1',
        stage: 'REPORT',
        title: 'Issue Submitted',
        description: 'User reported recurrent network degradation in Lab 3.',
        actor: 'Prof. Sharma',
        timestamp: new Date(Date.now() - 4 * 86400000).toISOString()
      },
      {
        id: 't2',
        stage: 'TRIAGE',
        title: 'AI Triage & Entity Extraction',
        description: 'Classified as IT & Network. Extracted Asset "Cisco AP-9120", Location "Lab 3". Linked to Recurring Failure Cluster #1.',
        actor: 'ImpactLoop NLP Engine',
        timestamp: new Date(Date.now() - 4 * 86400000 + 120000).toISOString()
      },
      {
        id: 't3',
        stage: 'ROUTING',
        title: 'Assigned to IT Infrastructure',
        description: 'Auto-routed to Alex Mercer with 48h SLA.',
        actor: 'ImpactLoop Smart Dispatch',
        timestamp: new Date(Date.now() - 4 * 86400000 + 300000).toISOString()
      }
    ]
  },
  {
    id: 'CAMPUS-102',
    title: 'Severe water leakage from ceiling in Block B 2nd Floor Washroom',
    description: 'Constant dripping water from pipe joint pooling across the floor tiles, creating slipping hazard.',
    domain: 'campus',
    category: 'Plumbing & Sanitation',
    department: 'Campus Maintenance',
    priority: 'HIGH',
    asset: 'Main PVC Drainage Pipe Joint',
    location: 'Hostel Block B, 2nd Floor Restroom',
    status: 'VERIFIED_CLOSED',
    reportedBy: 'Kavita Patel (Resident Assistant)',
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    resolvedAt: new Date(Date.now() - 2 * 86400000 - 3600000).toISOString(),
    verifiedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    assignedTo: 'Carlos Gomez (Head Plumber)',
    claimedBy: 'Carlos Gomez (Head Plumber)',
    slaHours: 24,
    evidence: {
      beforeImageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
      beforeNotes: 'Active leak with standing water puddle under washbasin junction.',
      afterImageUrl: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800&q=80',
      afterNotes: 'Replaced cracked 40mm PVC elbow joint, sealed with Teflon and epoxy collar. Area sanitized and dried.',
      submittedBy: 'Carlos Gomez',
      submittedAt: new Date(Date.now() - 2 * 86400000 - 3600000).toISOString()
    },
    adjudication: {
      status: 'VERIFIED_SUCCESSFUL',
      confidence: 96,
      summary: 'Before/After CV comparison confirms crack joint replaced, moisture reflection eliminated, and pipe properly re-anchored.',
      visualComparisonScore: 95,
      keyFindings: [
        'Zero fluid pooling detected on floor tile grid',
        'New industrial grade PVC coupling visible',
        'Dry surface texture verified by specular reflection analysis'
      ],
      rootCauseResolved: true,
      anomalyDetected: false,
      timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
      modelUsed: 'ImpactLoop Multimodal Adjudicator v2.4',
      impactScoreDelta: +10
    },
    timeline: [
      {
        id: 't10',
        stage: 'REPORT',
        title: 'Issue Submitted with Initial Photo',
        description: 'Photo showing active leak and wet hazard.',
        actor: 'Kavita Patel',
        timestamp: new Date(Date.now() - 6 * 86400000).toISOString()
      },
      {
        id: 't11',
        stage: 'TRIAGE',
        title: 'AI Triage & High Priority Escalation',
        description: 'Classified: Plumbing. Location: Block B Restroom. Priority: High.',
        actor: 'ImpactLoop AI',
        timestamp: new Date(Date.now() - 6 * 86400000 + 60000).toISOString()
      },
      {
        id: 't12',
        stage: 'ACTION_CLAIM',
        title: 'Resolution Claimed by Authority',
        description: 'Carlos Gomez marked repaired and uploaded after photo.',
        actor: 'Carlos Gomez',
        timestamp: new Date(Date.now() - 2 * 86400000 - 3600000).toISOString()
      },
      {
        id: 't13',
        stage: 'AI_VERIFICATION',
        title: 'AI Evidence Adjudication - VERIFIED',
        description: 'Computer Vision verified 96% confidence of fix. Case officially closed.',
        actor: 'ImpactLoop CV Engine',
        timestamp: new Date(Date.now() - 2 * 86400000).toISOString()
      },
      {
        id: 't14',
        stage: 'IMPACT_LOGGED',
        title: 'Impact Score Updated (+10 pts)',
        description: 'Campus Maintenance impact score increased to 88.',
        actor: 'System Ledger',
        timestamp: new Date(Date.now() - 2 * 86400000 + 1000).toISOString()
      }
    ]
  },
  {
    id: 'CAMPUS-103',
    title: 'Ceiling Fan in Lecture Hall 204 making loud grinding noise and vibrating',
    description: 'The middle ceiling fan in Hall 204 has loose mounting brackets and makes an unbearable screeching sound during lectures.',
    domain: 'campus',
    category: 'Electrical & Facilities',
    department: 'Electrical Works',
    priority: 'MEDIUM',
    asset: 'Havells 1200mm Ceiling Fan #4',
    location: 'Academic Complex, Room 204',
    status: 'PENDING_VERIFICATION',
    reportedBy: 'Dr. Aris Vance',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    assignedTo: 'Rajesh Kumar (Technician)',
    claimedBy: 'Rajesh Kumar (Technician)',
    slaHours: 36,
    evidence: {
      beforeImageUrl: 'https://images.unsplash.com/photo-1598084999768-4560d2b8a4f6?auto=format&fit=crop&w=800&q=80',
      beforeNotes: 'Fan off-axis wobbling with degraded ball bearing assembly.',
      afterImageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      afterNotes: 'Replaced bearing set 6202 and tightened downrod safety bolt.',
      submittedBy: 'Rajesh Kumar',
      submittedAt: new Date(Date.now() - 4 * 3600000).toISOString()
    },
    timeline: [
      {
        id: 't20',
        stage: 'REPORT',
        title: 'Issue Submitted',
        description: 'Lecture noise hazard reported.',
        actor: 'Dr. Aris Vance',
        timestamp: new Date(Date.now() - 2 * 86400000).toISOString()
      },
      {
        id: 't21',
        stage: 'TRIAGE',
        title: 'AI Triage Completed',
        description: 'Extracted: Electrical, Ceiling Fan, Room 204, Medium Priority.',
        actor: 'ImpactLoop AI',
        timestamp: new Date(Date.now() - 2 * 86400000 + 45000).toISOString()
      },
      {
        id: 't22',
        stage: 'ACTION_CLAIM',
        title: 'Action Claimed - Ready for Verification',
        description: 'Technician claimed repair complete with photo proof.',
        actor: 'Rajesh Kumar',
        timestamp: new Date(Date.now() - 4 * 3600000).toISOString()
      }
    ]
  },

  // --- 2. MUNICIPAL / CIVIC DOMAIN ---
  {
    id: 'CIVIC-201',
    title: 'Dangerous deep pothole on 5th Avenue & Elm St intersection',
    description: 'Approx 1.2m wide, 15cm deep pothole causing vehicle tire damage and severe hazard for two-wheelers in rain.',
    domain: 'civic',
    category: 'Roads & Infrastructure',
    department: 'Public Works Dept',
    priority: 'CRITICAL',
    asset: 'Asphalt Pavement Layer 4',
    location: '5th Ave & Elm St Crossroad, Ward 12',
    status: 'VERIFICATION_FAILED',
    reportedBy: 'Citizen Marcus Brody',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    assignedTo: 'Apex Road Contractors Ltd',
    claimedBy: 'Apex Road Contractors Ltd',
    slaHours: 24,
    evidence: {
      beforeImageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
      beforeNotes: 'Severe asphalt crater exposing sub-base gravel.',
      afterImageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
      afterNotes: 'Pothole filled with gravel and temporary patch.',
      submittedBy: 'Apex Contractors',
      submittedAt: new Date(Date.now() - 1 * 86400000 - 7200000).toISOString()
    },
    adjudication: {
      status: 'VERIFICATION_FAILED_REOPENED',
      confidence: 94,
      summary: 'AI Adjudication Rejected Claim: Contractor dumped loose gravel without bituminous compaction or asphalt seal. Sub-standard temporary patch fails municipal durability SLA.',
      visualComparisonScore: 32,
      keyFindings: [
        'No hot-mix asphalt sealant detected',
        'Edges remain jagged and unsealed, high risk of washout under rainfall',
        'Compaction density check failed visual texture standard'
      ],
      rootCauseResolved: false,
      anomalyDetected: true,
      timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
      modelUsed: 'ImpactLoop Civic Vision Adjudicator',
      impactScoreDelta: -15
    },
    timeline: [
      {
        id: 't30',
        stage: 'REPORT',
        title: 'Citizen Report Filed',
        description: 'Photo showing deep roadway crater.',
        actor: 'Marcus Brody',
        timestamp: new Date(Date.now() - 5 * 86400000).toISOString()
      },
      {
        id: 't31',
        stage: 'TRIAGE',
        title: 'AI Priority Escalation: Critical Hazard',
        description: 'Auto-dispatched to Public Works Ward 12.',
        actor: 'ImpactLoop AI',
        timestamp: new Date(Date.now() - 5 * 86400000 + 30000).toISOString()
      },
      {
        id: 't32',
        stage: 'ACTION_CLAIM',
        title: 'Contractor Claimed "Resolved"',
        description: 'Apex Contractors submitted gravel photo claiming completion.',
        actor: 'Apex Contractors',
        timestamp: new Date(Date.now() - 1 * 86400000 - 7200000).toISOString()
      },
      {
        id: 't33',
        stage: 'AI_VERIFICATION',
        title: 'AI Verification FAILED & REOPENED',
        description: 'Automated CV audit rejected claim. Penalized Public Works rating and triggered re-inspection notice.',
        actor: 'ImpactLoop CV Engine',
        timestamp: new Date(Date.now() - 1 * 86400000).toISOString()
      },
      {
        id: 't34',
        stage: 'REOPENED',
        title: 'Escalated to Municipal Commissioner',
        description: 'Sub-standard repair audit logged. Assigned 12h urgent remedy SLA.',
        actor: 'ImpactLoop System Policy',
        timestamp: new Date(Date.now() - 1 * 86400000 + 1000).toISOString()
      }
    ]
  },
  {
    id: 'CIVIC-202',
    title: 'High-mast streetlight pole dark near North Gate Public Park',
    description: 'Streetlight #NL-408 has been unlit for 3 consecutive nights. Public safety risk along the pedestrian walkway.',
    domain: 'civic',
    category: 'Electrical & Lighting',
    department: 'Municipal Energy Dept',
    priority: 'HIGH',
    asset: 'LED High-Mast Luminaire #NL-408',
    location: 'North Gate Park Perimeter, Sector 4',
    status: 'VERIFIED_CLOSED',
    reportedBy: 'Citizens Watch Group',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    resolvedAt: new Date(Date.now() - 13 * 3600000).toISOString(),
    verifiedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    assignedTo: 'SunGrid Municipal Crew',
    claimedBy: 'SunGrid Municipal Crew',
    slaHours: 24,
    evidence: {
      beforeImageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
      beforeNotes: 'Complete blackout at Sector 4 pedestrian walkway.',
      afterImageUrl: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=800&q=80',
      afterNotes: 'Replaced faulty 150W driver unit and installed new smart photocell relay.',
      submittedBy: 'SunGrid Crew Lead',
      submittedAt: new Date(Date.now() - 13 * 3600000).toISOString()
    },
    adjudication: {
      status: 'VERIFIED_SUCCESSFUL',
      confidence: 98,
      summary: 'Illumination verification passed. Lux level distribution verified above 45 lux standard across perimeter pavement.',
      visualComparisonScore: 97,
      keyFindings: [
        'Active 150W LED emitter illuminated',
        'Pedestrian walkway visibility verified',
        'Photocell telemetry handshake confirmed operational'
      ],
      rootCauseResolved: true,
      anomalyDetected: false,
      timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
      modelUsed: 'ImpactLoop Multimodal Adjudicator',
      impactScoreDelta: +8
    },
    timeline: [
      {
        id: 't40',
        stage: 'REPORT',
        title: 'Issue Reported',
        description: 'Night blackout reported at park walkway.',
        actor: 'Citizens Watch Group',
        timestamp: new Date(Date.now() - 3 * 86400000).toISOString()
      },
      {
        id: 't41',
        stage: 'TRIAGE',
        title: 'AI Triage & Route to Energy Dept',
        description: 'Priority: High. Asset: Luminaire #NL-408.',
        actor: 'ImpactLoop AI',
        timestamp: new Date(Date.now() - 3 * 86400000 + 40000).toISOString()
      },
      {
        id: 't42',
        stage: 'ACTION_CLAIM',
        title: 'Driver Replacement Claimed',
        description: 'Crew uploaded night illumination verification photo.',
        actor: 'SunGrid Crew Lead',
        timestamp: new Date(Date.now() - 13 * 3600000).toISOString()
      },
      {
        id: 't43',
        stage: 'AI_VERIFICATION',
        title: 'AI Verification Approved (98% Confidence)',
        description: 'Verified active illumination and safety lux levels.',
        actor: 'ImpactLoop CV Engine',
        timestamp: new Date(Date.now() - 12 * 3600000).toISOString()
      }
    ]
  },

  // --- 3. ENTERPRISE FACILITIES DOMAIN ---
  {
    id: 'CORP-301',
    title: 'Server Room B HVAC condensation dripping above Server Rack 4',
    description: 'Chilled water coil overflowing condensation tray directly above high-density compute rack. Threat of short circuit.',
    domain: 'enterprise',
    category: 'HVAC & Environmental',
    department: 'Enterprise Facilities',
    priority: 'CRITICAL',
    asset: 'Daikin Precision Cooling Unit #AC-02',
    location: 'Building A, Basement Data Center Room B',
    status: 'IN_PROGRESS',
    reportedBy: 'Datacenter Ops Monitor',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    assignedTo: 'David Zhang (HVAC Specialist)',
    slaHours: 8,
    recurringClusterId: 'CLUSTER-CORP-01',
    evidence: {
      beforeImageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
      beforeNotes: 'Condensate drip tray drain line clogged with particulate buildup.',
    },
    timeline: [
      {
        id: 't50',
        stage: 'REPORT',
        title: 'Critical Alarm Triggered',
        description: 'Moisture sensor and technician logged dripping line over Rack 4.',
        actor: 'Datacenter Ops',
        timestamp: new Date(Date.now() - 1 * 86400000).toISOString()
      },
      {
        id: 't51',
        stage: 'TRIAGE',
        title: 'AI Emergency Triage: CRITICAL SLA',
        description: 'Extracted Asset Daikin AC-02, High risk infrastructure category.',
        actor: 'ImpactLoop AI',
        timestamp: new Date(Date.now() - 1 * 86400000 + 10000).toISOString()
      },
      {
        id: 't52',
        stage: 'ROUTING',
        title: 'Direct Dispatch to HVAC Specialist',
        description: 'Auto-escalated with 8h SLA.',
        actor: 'ImpactLoop Smart Dispatch',
        timestamp: new Date(Date.now() - 1 * 86400000 + 60000).toISOString()
      }
    ]
  },
  {
    id: 'CORP-302',
    title: 'RFID Badge Reader malfunction at Executive Tower Turnstile 3',
    description: 'Badge scanner fails 7 out of 10 times, causing major bottleneck during 8:30 AM to 9:30 AM arrival rush.',
    domain: 'enterprise',
    category: 'Security & Access',
    department: 'Physical Security Ops',
    priority: 'MEDIUM',
    asset: 'HID Signo 40 Smart Card Reader',
    location: 'Main Lobby, East Turnstile Bank 3',
    status: 'REPORTED',
    reportedBy: 'Lobby Security Staff',
    createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 3600000).toISOString(),
    slaHours: 24,
    evidence: {
      beforeImageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
      beforeNotes: 'Optical cover scratched, internal antenna misalignment suspected.',
    },
    timeline: [
      {
        id: 't60',
        stage: 'REPORT',
        title: 'Issue Intake Logged',
        description: 'Security reported frequent badge timeouts.',
        actor: 'Lobby Security',
        timestamp: new Date(Date.now() - 8 * 3600000).toISOString()
      },
      {
        id: 't61',
        stage: 'TRIAGE',
        title: 'AI Triage & Deduplication Check',
        description: 'Matched with similar complaint from yesterday; linked to turnaround ticket.',
        actor: 'ImpactLoop AI',
        timestamp: new Date(Date.now() - 8 * 3600000 + 40000).toISOString()
      }
    ]
  }
];

const DEFAULT_RECURRING_PATTERNS: RecurringPatternCluster[] = [
  {
    id: 'CLUSTER-CAMPUS-01',
    domain: 'campus',
    title: 'Science Block Lab 3 Wi-Fi Systematic Degradation',
    category: 'IT & Network',
    asset: 'Cisco AP-9120 Access Point Array',
    location: 'Science Block, Lab 3',
    frequencyCount: 14,
    timeframe: 'Last 30 Days (Mondays 10 AM - 1 PM)',
    patternType: 'TEMPORAL_CYCLE',
    rootCauseHypothesis: 'Dual-band channel collision combined with 120+ student BYOD connections exceeding single AP DHCP pool threshold during weekly CS Labs.',
    aiRecommendation: 'Deploy dedicated secondary high-density 6GHz AP-9130 and reallocate subnets before next Monday schedule.',
    severity: 'CRITICAL',
    issueIds: ['CAMPUS-101'],
    lastOccurrence: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: 'CLUSTER-CIVIC-01',
    domain: 'civic',
    title: 'Ward 12 5th Avenue Chronic Pothole & Sub-base Subsidence',
    category: 'Roads & Infrastructure',
    asset: 'Sub-base Storm Drain Crossing #4',
    location: '5th Ave & Elm St Intersection',
    frequencyCount: 6,
    timeframe: 'Last 60 Days (Following precipitation events)',
    patternType: 'WEATHER_CORRELATED',
    rootCauseHypothesis: 'Leaking underground municipal stormwater culvert is washing away road sub-base aggregate, causing asphalt surface collapse repeatedly despite surface patching.',
    aiRecommendation: 'Contractors are repeatedly applying surface patches without excavating the leaking culvert. Mandate stormwater joint repair before re-paving.',
    severity: 'HIGH',
    issueIds: ['CIVIC-201'],
    lastOccurrence: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 'CLUSTER-CORP-01',
    domain: 'enterprise',
    title: 'Data Center HVAC Chilled Water Condensate Anomaly',
    category: 'HVAC & Environmental',
    asset: 'Daikin Precision Cooling Loop',
    location: 'Basement Data Center Room B',
    frequencyCount: 4,
    timeframe: 'Last 21 Days',
    patternType: 'ASSET_DEGRADATION',
    rootCauseHypothesis: 'Algae bloom inside the secondary drain trap causing recurring siphon blockage during high humidity shifts.',
    aiRecommendation: 'Perform chemical biocide flush on condensate trap line and install automated float switch cutoff alarm.',
    severity: 'CRITICAL',
    issueIds: ['CORP-301'],
    lastOccurrence: new Date(Date.now() - 1 * 86400000).toISOString()
  }
];

// In-Memory & File Cache helper
export function getLocalDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      const initialDb: DatabaseSchema = {
        issues: DEFAULT_ISSUES,
        recurringPatterns: DEFAULT_RECURRING_PATTERNS,
        lastUpdated: new Date().toISOString()
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
      return initialDb;
    }

    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    return {
      issues: DEFAULT_ISSUES,
      recurringPatterns: DEFAULT_RECURRING_PATTERNS,
      lastUpdated: new Date().toISOString()
    };
  }
}

export function saveLocalDatabase(data: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving local db file:', error);
  }
}

// Synchronous bridge for immediate operations
export function getDatabase(): DatabaseSchema {
  return getLocalDatabase();
}

export function saveDatabase(data: DatabaseSchema): void {
  saveLocalDatabase(data);

  // Background async sync to MongoDB Atlas
  syncToMongoAtlas(data).catch(err => {
    console.warn('MongoDB Atlas background sync notice:', err.message);
  });
}

// Async MongoDB Atlas Integration
async function syncToMongoAtlas(data: DatabaseSchema) {
  const db = await connectToDatabase();
  if (!db) return;

  try {
    // Bulk upsert issues into MongoDB
    for (const issue of data.issues) {
      await IssueModel.findOneAndUpdate({ id: issue.id }, issue, { upsert: true });
    }
    for (const pattern of data.recurringPatterns) {
      await RecurringPatternModel.findOneAndUpdate({ id: pattern.id }, pattern, { upsert: true });
    }
  } catch (e) {
    console.warn('MongoDB sync error:', e);
  }
}

export async function fetchFromMongoAtlas(): Promise<DatabaseSchema | null> {
  const db = await connectToDatabase();
  if (!db) return null;

  try {
    const issues = await IssueModel.find({}).lean();
    const recurringPatterns = await RecurringPatternModel.find({}).lean();

    if (issues && issues.length > 0) {
      const atlasDb: DatabaseSchema = {
        issues: issues.map(i => {
          const { _id, __v, ...rest } = i as any;
          return rest as Issue;
        }),
        recurringPatterns: recurringPatterns.map(p => {
          const { _id, __v, ...rest } = p as any;
          return rest as RecurringPatternCluster;
        }),
        lastUpdated: new Date().toISOString()
      };
      // Keep local file in sync
      saveLocalDatabase(atlasDb);
      return atlasDb;
    } else {
      // If Atlas collection is empty, seed it with default rich dataset
      const local = getLocalDatabase();
      await syncToMongoAtlas(local);
      return local;
    }
  } catch (e) {
    console.warn('Error reading from Atlas, using local store:', e);
    return null;
  }
}

export function resetDatabase(): DatabaseSchema {
  const initialDb: DatabaseSchema = {
    issues: DEFAULT_ISSUES,
    recurringPatterns: DEFAULT_RECURRING_PATTERNS,
    lastUpdated: new Date().toISOString()
  };
  saveDatabase(initialDb);
  return initialDb;
}

export function calculateDepartmentMetrics(domain?: DomainType): DepartmentMetric[] {
  const db = getDatabase();
  const issues = domain ? db.issues.filter(i => i.domain === domain) : db.issues;

  const departmentMap = new Map<string, {
    domain: DomainType;
    assigned: number;
    claimed: number;
    verified: number;
    failed: number;
    totalDays: number;
    slaCompliant: number;
    recurringCount: number;
  }>();

  for (const issue of issues) {
    const dept = issue.department || 'General Operations';
    if (!departmentMap.has(dept)) {
      departmentMap.set(dept, {
        domain: issue.domain,
        assigned: 0,
        claimed: 0,
        verified: 0,
        failed: 0,
        totalDays: 0,
        slaCompliant: 0,
        recurringCount: 0
      });
    }

    const stat = departmentMap.get(dept)!;
    stat.assigned += 1;

    if (issue.status === 'PENDING_VERIFICATION' || issue.status === 'VERIFIED_CLOSED' || issue.status === 'VERIFICATION_FAILED') {
      stat.claimed += 1;
    }

    if (issue.status === 'VERIFIED_CLOSED') {
      stat.verified += 1;
      const created = new Date(issue.createdAt).getTime();
      const resolved = new Date(issue.verifiedAt || issue.updatedAt).getTime();
      const days = Math.max(0.5, (resolved - created) / (1000 * 86400));
      stat.totalDays += days;

      if (days * 24 <= issue.slaHours * 1.2) {
        stat.slaCompliant += 1;
      }
    }

    if (issue.status === 'VERIFICATION_FAILED') {
      stat.failed += 1;
    }

    if (issue.recurringClusterId) {
      stat.recurringCount += 1;
    }
  }

  const result: DepartmentMetric[] = [];

  departmentMap.forEach((stat, deptName) => {
    const verifiedRate = stat.claimed > 0 ? Math.round((stat.verified / stat.claimed) * 100) : 0;
    const avgDays = stat.verified > 0 ? Number((stat.totalDays / stat.verified).toFixed(1)) : 2.5;
    const slaRate = stat.verified > 0 ? Math.round((stat.slaCompliant / stat.verified) * 100) : 85;

    // Formula: Impact Score = (Verified Rate * 0.5) + (SLA Compliance * 0.3) + (20 - Penalty)
    const penalty = stat.claimed > 0 ? (stat.failed / stat.claimed) * 40 : 0;
    const rawScore = (verifiedRate * 0.5) + (slaRate * 0.3) + (20 - penalty);
    const impactScore = Math.min(100, Math.max(10, Math.round(rawScore)));

    result.push({
      department: deptName,
      domain: stat.domain,
      problemsAssigned: stat.assigned,
      claimedResolutions: stat.claimed,
      verifiedResolutions: stat.verified,
      failedVerifications: stat.failed,
      avgResolutionDays: avgDays,
      verifiedResolutionRate: verifiedRate,
      impactScore: impactScore,
      slaComplianceRate: slaRate,
      activeRecurringIssues: stat.recurringCount
    });
  });

  return result.sort((a, b) => b.impactScore - a.impactScore);
}

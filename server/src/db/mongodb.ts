import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // ignore if already set
}

import mongoose from 'mongoose';

interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose | null> | null;
}

declare global {
  var mongooseCache: CachedConnection | undefined;
}

let cached: CachedConnection = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.warn('⚠️ MONGODB_URI not configured in environment variables');
    return null;
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      console.log('✅ Connected to MongoDB Atlas (proof_of_impact db)');
      return m;
    }).catch(err => {
      console.warn('⚠️ MongoDB Atlas connection notice, using local resilient cache:', err.message);
      cached.promise = null;
      return null;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    return null;
  }

  return cached.conn;
}

// --- Mongoose Schemas & Models ---

const EvidenceSchema = new mongoose.Schema({
  beforeImageUrl: { type: String },
  beforeNotes: { type: String },
  afterImageUrl: { type: String },
  afterNotes: { type: String },
  submittedBy: { type: String },
  submittedAt: { type: String }
}, { _id: false });

const AdjudicationSchema = new mongoose.Schema({
  status: { type: String },
  confidence: { type: Number },
  summary: { type: String },
  visualComparisonScore: { type: Number },
  keyFindings: [{ type: String }],
  rootCauseResolved: { type: Boolean },
  anomalyDetected: { type: Boolean },
  timestamp: { type: String },
  modelUsed: { type: String },
  impactScoreDelta: { type: Number }
}, { _id: false });

const TimelineSchema = new mongoose.Schema({
  id: { type: String },
  stage: { type: String },
  title: { type: String },
  description: { type: String },
  actor: { type: String },
  timestamp: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { _id: false });

const IssueSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  domain: { type: String, required: true, enum: ['campus', 'civic', 'enterprise'], index: true },
  category: { type: String, required: true },
  department: { type: String, required: true },
  priority: { type: String, required: true, enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] },
  asset: { type: String, required: true },
  location: { type: String, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['REPORTED', 'TRIAGED', 'IN_PROGRESS', 'PENDING_VERIFICATION', 'VERIFIED_CLOSED', 'VERIFICATION_FAILED'],
    index: true 
  },
  reportedBy: { type: String, default: 'Citizen / Reporter' },
  createdAt: { type: String, required: true },
  updatedAt: { type: String, required: true },
  resolvedAt: { type: String },
  verifiedAt: { type: String },
  assignedTo: { type: String },
  claimedBy: { type: String },
  slaHours: { type: Number, default: 24 },
  evidence: { type: EvidenceSchema, default: {} },
  adjudication: { type: AdjudicationSchema },
  timeline: { type: [TimelineSchema], default: [] },
  duplicateOfId: { type: String },
  recurringClusterId: { type: String }
}, {
  timestamps: false,
  collection: 'issues'
});

const RecurringPatternSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  domain: { type: String, required: true, enum: ['campus', 'civic', 'enterprise'], index: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  asset: { type: String, required: true },
  location: { type: String, required: true },
  frequencyCount: { type: Number, default: 1 },
  timeframe: { type: String },
  patternType: { type: String, default: 'TEMPORAL_CYCLE' },
  rootCauseHypothesis: { type: String },
  aiRecommendation: { type: String },
  severity: { type: String, default: 'HIGH' },
  issueIds: [{ type: String }],
  lastOccurrence: { type: String }
}, {
  timestamps: false,
  collection: 'recurring_patterns'
});

export const IssueModel: mongoose.Model<any> = (mongoose.models && mongoose.models.Issue) || mongoose.model('Issue', IssueSchema);
export const RecurringPatternModel: mongoose.Model<any> = (mongoose.models && mongoose.models.RecurringPattern) || mongoose.model('RecurringPattern', RecurringPatternSchema);

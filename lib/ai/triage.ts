import { AITriageRequest, AITriageResponse, IssuePriority, IssueStatus } from '../types';
import { getDatabase } from '../store';

// Semantic string similarity helper (Dice Coefficient / Bigram overlap)
function calculateStringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const s2 = str2.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  
  if (s1 === s2) return 1.0;
  if (s1.length < 2 || s2.length < 2) return 0.0;

  const getBigrams = (str: string) => {
    const bigrams = new Set<string>();
    for (let i = 0; i < str.length - 1; i++) {
      bigrams.add(str.substring(i, i + 2));
    }
    return bigrams;
  };

  const b1 = getBigrams(s1);
  const b2 = getBigrams(s2);
  let intersection = 0;
  b1.forEach(bg => {
    if (b2.has(bg)) intersection++;
  });

  return (2.0 * intersection) / (b1.size + b2.size);
}

export async function runAITriage(request: AITriageRequest): Promise<AITriageResponse> {
  const combinedText = `${request.title} ${request.description}`.toLowerCase();
  const db = getDatabase();
  const domainIssues = db.issues.filter(i => i.domain === request.domain);

  // Check for semantic duplicates
  const potentialDuplicates = domainIssues
    .map(existing => {
      const titleSim = calculateStringSimilarity(request.title, existing.title);
      const descSim = calculateStringSimilarity(request.description, existing.description);
      const overallSim = (titleSim * 0.7) + (descSim * 0.3);
      return {
        id: existing.id,
        title: existing.title,
        similarity: Math.round(overallSim * 100),
        status: existing.status,
        location: existing.location
      };
    })
    .filter(item => item.similarity >= 38)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3);

  // Gemini API integration if API key is present
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (geminiApiKey) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are ImpactLoop AI triage engine. Analyze this reported problem in the "${request.domain}" domain:
Title: "${request.title}"
Description: "${request.description}"

Respond in exact JSON format:
{
  "category": "string (e.g. Electrical, Plumbing, IT & Network, Roads & Civil, HVAC, Security)",
  "department": "string (assigned department name)",
  "priority": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "asset": "string (specific extracted physical asset or system)",
  "location": "string (extracted room/street/building location)",
  "summary": "string (concise 1-sentence operational summary)",
  "confidence": number (80-99)
}`
            }]
          }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          return {
            category: parsed.category || 'General Maintenance',
            department: parsed.department || 'Operations',
            priority: (['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(parsed.priority) ? parsed.priority : 'MEDIUM') as IssuePriority,
            asset: parsed.asset || 'Infrastructure Asset',
            location: parsed.location || 'General Area',
            summary: parsed.summary || request.title,
            confidence: parsed.confidence || 92,
            potentialDuplicates
          };
        }
      }
    } catch (e) {
      console.warn('Gemini API call failed, falling back to built-in NLP engine:', e);
    }
  }

  // Built-in Deterministic NLP Heuristics Engine
  let category = 'General Infrastructure';
  let department = 'Operations & Maintenance';
  let priority: IssuePriority = 'MEDIUM';
  let asset = 'Facility Equipment';
  let location = 'Campus / City Area';

  // Domain & Keyword Taxonomies
  if (combinedText.includes('wi-fi') || combinedText.includes('wifi') || combinedText.includes('internet') || combinedText.includes('network') || combinedText.includes('packet') || combinedText.includes('server') || combinedText.includes('router') || combinedText.includes('switch')) {
    category = 'IT & Network';
    department = request.domain === 'campus' ? 'IT Infrastructure' : (request.domain === 'enterprise' ? 'Datacenter & IT Ops' : 'Smart City Network');
    priority = combinedText.includes('server') || combinedText.includes('critical') || combinedText.includes('down') ? 'CRITICAL' : 'HIGH';
    asset = combinedText.includes('ap') || combinedText.includes('access point') ? 'Cisco Access Point #3' : (combinedText.includes('server') ? 'Compute Cluster' : 'Network Switch Port');
  } else if (combinedText.includes('fan') || combinedText.includes('light') || combinedText.includes('power') || combinedText.includes('electric') || combinedText.includes('short circuit') || combinedText.includes('spark') || combinedText.includes('lamp') || combinedText.includes('luminaire')) {
    category = 'Electrical & Lighting';
    department = request.domain === 'civic' ? 'Municipal Energy Dept' : 'Electrical Works';
    priority = combinedText.includes('spark') || combinedText.includes('smoke') || combinedText.includes('hazard') ? 'CRITICAL' : (combinedText.includes('fan') ? 'MEDIUM' : 'HIGH');
    asset = combinedText.includes('fan') ? 'Ceiling Fan #4' : (combinedText.includes('street') ? 'LED High-Mast Luminaire' : 'Electrical Breaker Panel');
  } else if (combinedText.includes('leak') || combinedText.includes('pipe') || combinedText.includes('water') || combinedText.includes('drain') || combinedText.includes('plumb') || combinedText.includes('flood') || combinedText.includes('tap')) {
    category = 'Plumbing & Water Systems';
    department = request.domain === 'civic' ? 'Water Supply & Sewerage Board' : 'Plumbing Maintenance';
    priority = combinedText.includes('severe') || combinedText.includes('flood') || combinedText.includes('burst') ? 'CRITICAL' : 'HIGH';
    asset = combinedText.includes('drain') ? 'PVC Storm Drainage Joint' : 'Main Supply Pipe Valve';
  } else if (combinedText.includes('pothole') || combinedText.includes('road') || combinedText.includes('asphalt') || combinedText.includes('crack') || combinedText.includes('pavement') || combinedText.includes('sidewalk')) {
    category = 'Roads & Civil Infrastructure';
    department = 'Public Works Dept';
    priority = combinedText.includes('deep') || combinedText.includes('hazard') || combinedText.includes('accident') ? 'CRITICAL' : 'HIGH';
    asset = 'Bituminous Asphalt Pavement Layer';
  } else if (combinedText.includes('ac') || combinedText.includes('cooling') || combinedText.includes('hvac') || combinedText.includes('chiller') || combinedText.includes('temperature') || combinedText.includes('hot')) {
    category = 'HVAC & Climate Control';
    department = 'Facilities Management';
    priority = combinedText.includes('server') || combinedText.includes('datacenter') ? 'CRITICAL' : 'HIGH';
    asset = 'Precision Chilled Water Air Handler';
  } else if (combinedText.includes('garbage') || combinedText.includes('waste') || combinedText.includes('trash') || combinedText.includes('clean') || combinedText.includes('dump')) {
    category = 'Sanitation & Waste';
    department = 'Public Sanitation Unit';
    priority = 'MEDIUM';
    asset = 'Municipal Waste Collector Zone';
  } else if (combinedText.includes('badge') || combinedText.includes('door') || combinedText.includes('turnstile') || combinedText.includes('lock') || combinedText.includes('security') || combinedText.includes('camera')) {
    category = 'Physical Security & Access';
    department = 'Security Operations';
    priority = combinedText.includes('breach') ? 'CRITICAL' : 'MEDIUM';
    asset = 'Smart Card RFID Turnstile #3';
  }

  // Location extraction heuristics
  const roomMatch = request.title.match(/(?:room|lab|block|sector|ward|hall|floor|rack|avenue|street|st|ave|lane)\s+[a-z0-9\-]+/i) ||
                    request.description.match(/(?:room|lab|block|sector|ward|hall|floor|rack|avenue|street|st|ave|lane)\s+[a-z0-9\-]+/i);
  if (roomMatch) {
    location = roomMatch[0].toUpperCase();
  } else if (request.domain === 'campus') {
    location = 'Academic Complex Block B';
  } else if (request.domain === 'civic') {
    location = 'Ward 12 Central Sector';
  } else {
    location = 'HQ Tower East Wing';
  }

  return {
    category,
    department,
    priority,
    asset,
    location,
    summary: `AI auto-routed to ${department} with extracted asset ${asset} at ${location}.`,
    confidence: 94,
    potentialDuplicates
  };
}

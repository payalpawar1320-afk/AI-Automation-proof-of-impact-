# spec.md: ImpactLoop AI

## 1. Product Overview
**ImpactLoop AI** is a closed-loop, AI-powered accountability and problem-resolution platform. Unlike traditional CRUD-based ticketing systems that end at "case closed," ImpactLoop mandates verified evidence of resolution. By combining Natural Language Processing (NLP), Computer Vision (CV), and predictive analytics, the system shifts complaint management from reactive ticket routing to proactive, verified root-cause elimination.

## 2. Core Workflow: The Accountability Loop
The system replaces the standard `Report → Assign → Resolve → Close` pipeline with an evidence-based verification loop:

1. **Intake:** User submits an issue via text or image.
2. **AI Triage:** NLP categorizes the issue, extracts entities (Asset, Location, Priority), and checks for duplicates.
3. **Routing:** System automatically assigns the ticket to the appropriate operational department.
4. **Action & Claim:** Authority marks the issue as "Resolved."
5. **Evidence Verification:** Reporter submits "After" photographic evidence or confirmation.
6. **AI Adjudication:** CV compares Before/After states.
   * *Verified:* Case closed, Impact Score updated.
   * *Not Fixed:* Case automatically reopened and escalated.
7. **Analytics:** AI logs resolution metrics and scans for recurring patterns.

## 3. AI Module Architecture
Artificial Intelligence is isolated to specific, high-value nodes within the workflow rather than applied arbitrarily.

### 3.1. NLP Engine (Categorization & Routing)
Parses unstructured user input into structured database schemas.
* **Input:** `"Fan in room 204 isn't working."`
* **Output:** `{Category: "Electrical", Location: "Room 204", Priority: "Medium", Asset: "Ceiling Fan"}`

### 3.2. Semantic Deduplication
Identifies underlying identical issues reported with different phrasing to prevent redundant dispatching.
* **Logic:** Maps `"AC is not cooling"` and `"Room is too hot because AC isn't working"` to a single master ticket.

### 3.3. Computer Vision Verification
Authenticates the completion of physical maintenance tasks.
* **Mechanism:** Image-to-image comparative analysis.
* **Execution:** Compares the initial state photo (e.g., `"Water leakage in Block B washroom"`) against the resolution photo uploaded by the user or staff to verify the fix before closing the loop.

### 3.4. Predictive Pattern Engine
Transitions operations from reactive to proactive maintenance by identifying temporal and spatial anomalies.
* **Execution:** Detects frequency clusters (e.g., *Lab 3 Wi-Fi drops every Monday 10 AM – 1 PM*).
* **Output:** Generates alerts for predicted infrastructure failures before user complaints spike.

### 3.5. Generative Reporting
Provides natural language querying for administrative oversight.
* **Query:** *"What are the biggest infrastructure problems this month?"*
* **Response:** *"Wi-Fi accounted for 31% of IT complaints, with Lab 3 responsible for 44% of network incidents."*

## 4. Key Features & Dashboards

### 4.1. Recurring Problem Detector
Aggregates similar complaints over a rolling timeframe to identify systemic failures rather than isolated incidents.
* **Example:** Aggregates 14 distinct reports of "No network in Lab 3" over 30 days into a single parent ticket: **Recurring Infrastructure Issue #17**.

### 4.2. Departmental Impact Scoring
A live decision-support dashboard that ranks operational efficiency using verifiable data, not just self-reported ticket closures.

| Department | Problems Assigned | Avg. Resolution Time | Verified Resolution Rate | Impact Score |
| :--- | :--- | :--- | :--- | :--- |
| **IT** | 120 | 3.2 days | 91% | **92** |
| **Electrical** | 80 | 2.1 days | 95% | **95** |
| **Maintenance** | 145 | 6.8 days | 61% | **64** |

## 5. Domain Scalability
The architecture is schema-agnostic, allowing deployment across multiple verticals by swapping domain-specific taxonomies:

* **Educational Institutions:** Hostel issues, AV/classroom equipment, campus Wi-Fi, cleanliness.
* **Municipal/Civic Governance:** Potholes, streetlights, illegal dumping, drainage/leakage.
* **Enterprise/Corporate Facilities:** IT hardware failures, security breaches, HVAC maintenance, facility hazards.

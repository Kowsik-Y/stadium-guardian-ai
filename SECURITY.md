# Security Policy

Stadium Guardian AI (EcoFlow) enforces strict security guidelines at both the architectural layer and runtime environment to protect tournament operations data.

---

## Implemented Security Controls

1. **Environment Key Isolation**: All API credentials (Firebase App IDs, Google Maps keys, and Gemini API keys) are restricted to backend routes (`/api/reasoning` and `/api/copilot`) or injected via `.env.local` to prevent leakage to public Git repositories.
2. **Safe Input Sanitization**: Spectator text alerts and CSV files uploaded to the test bed are parsed client-side through standard validation blocks, converting numbers and strings explicitly, protecting against injection attacks.
3. **Sandbox Fallback Protection**: If GCP environment keys are absent, the application launches a secure local mock database and reasoning context, executing all code in the client's local memory sandbox without querying external resources.
4. **Firebase Firestore Security Rules**: Enforces resource-level permission constraints. Volunteers can read active telemetry, while editing is reserved for authenticated operations marshals.

---

## Recommended Firestore Security Rules

Deploy these rules to your Firebase console to restrict data reading and writing inside production environments:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Telemetry updates (Gates & Bins)
    match /gates/{gateId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.role == "operations-lead";
    }

    match /bins/{binId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }

    // Incident alerts
    match /incidents/{incidentId} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null;
      allow delete: if false; // Incidents cannot be deleted, only marked as resolved
    }
  }
}
```

---

## Reporting a Vulnerability

Please do not open GitHub issues for security vulnerabilities. If you find a security issue in the operations orchestrator, report it directly to:

**stadium-ops-security@fifa.com**

Please include:
- A detailed description of the vulnerability.
- Steps to reproduce or a Proof of Concept (PoC) payload.
- Potential impact on ground volunteers or stadium logistics control room systems.

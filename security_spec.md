# Security Specification for Vitor Leonardo Engenharia Mecânica

This specification outlines the data validation invariants, threats, and security testing payloads for the Firestore rules governing the operational platform.

## 1. Data Invariants
- **Admins** have unrestricted read and write access to all clients, equipments, laudos, and checklists.
- **Clients** (authenticated users mapped to a specific `clientId` inside their profile) can read their own client record, and only view equipments, laudos, and checklists containing their `clientId`.
- **User Profiles** can only be created by signed-in users for themselves, and they cannot escalate their own `role` or declare themselves as `admin`.
- **System Integrity**: Fields like `createdAt` are immutable. Timestamps must align precisely with `request.time`.

## 2. The "Dirty Dozen" Threat Payloads
Here are 12 malicious payloads meant to verify boundary protection:

1. **Self-Escalation**: User attempting to register with `role: "admin"`.
2. **Ghost Profile Creation**: Overwriting another user's profile with a duplicate auth key.
3. **Invalid ID Injection**: Long or malformed IDs to exhaust memory or database quotas (Resource Poisoning).
4. **Unauthenticated Write**: Creating client documents without a valid token.
5. **PII Blanket Scraping**: Listing other users' emails without specific ownership constraints.
6. **Relational Orphan**: Adding equipment linked to a non-existent client.
7. **Asset Hijack**: Modifying another client's tech laudo document.
8. **Status Bypass**: Directly pushing a laudo state from `em_elaboracao` to `emitido` without proper signature updates.
9. **Malicious Content Spraying**: Passing 1MB strings for type, brand, or model inputs.
10. **Timestamp Spoofing**: Setting `createdAt` back to 2010 to cheat or bypass temporal integrity rules.
11. **Checklist Alteration**: A client attempting to edit an inspector's completed checklist report.
12. **Admin Whitelist Inject**: Writing to the `admins` collection directly to become a permanent admin.

## 3. Security Design Evaluation Grid
| Threat | Mitigation Mechanism | Rule Block Validation | Pass/Fail Expected |
| --- | --- | --- | --- |
| Identity Spoofing | Match token field against actual payload IDs | `isOwnerOfUserDoc(userId)` | PASS |
| Role Escalation | Restrict modifications to non-role properties | `!incoming().keys().hasAny(['role'])` | PASS |
| Resource Poisoning | Limit string sizes and enforce validation | `isValidId(id)` & `.size() <= MAX` | PASS |
| Orphaned Writes | Validate parent document relational context | `get(...)` check verification | PASS |
| Temporal Spoofing | Mandate request.time alignment | `createdAt == request.time` | PASS |

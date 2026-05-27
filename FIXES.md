# 🏥 HAQMS Security & Performance Audit

This document outlines the top 10 critical bugs resolved in the Hospital Appointment & Queue Management System (HAQMS). All fixes adhere strictly to the prioritized execution matrix, focusing on resilient production-grade solutions over application-level workarounds.

---

## 🚨 Priority 1: Critical Security & Auth

### 🐛 1. Doctor Directory SQL Injection

- **Category:** Security
- **Severity:** Critical
- **Root Cause Analysis:** The `/api/doctors` route received unsanitized `search` inputs directly via template literals in a `prisma.$queryRawUnsafe` query. An attacker could exploit this by escaping the string boundary and injecting malicious SQL instructions (e.g., pulling password hashes from the `User` table).
- **The Fix:** Removed raw string building and refactored the route to leverage Prisma's native `findMany` ORM capabilities.

```javascript
// Before
const query = `SELECT * FROM "Doctor" WHERE name ILIKE '%${search}%'`;
const doctors = await prisma.$queryRawUnsafe(query);

// After
const doctors = await prisma.doctor.findMany({
  where: { name: { contains: search, mode: "insensitive" } },
});
```

- **Engineering Reasoning:** Prisma's structured query Engine inherently parameterizes variables and sanitizes input, fully nullifying SQL injection attacks without needing distinct regex/sanitization logic.
- **Best Practice Applied:** Prepared Statements / Parameterized Queries.

### 🐛 2. Plaintext Credential Logging & Hash Leaks

- **Category:** Security
- **Severity:** Critical
- **Root Cause Analysis:** The `/api/auth/register` and `/api/auth/login` functions indiscriminately serialized and dumped `req.body` into standard output `console.log`. Further, the registration route blindly returned the newly created user object, exposing the database password hash in the HTTP response.
- **The Fix:** Removed the offensive console logs. Chained a `select` payload onto the Prisma `.create()` call to explicitly whitelist only safe fields.

```javascript
// Before
console.log(
  `Login attempt: ${req.body.email} with password: ${req.body.password}`,
);
res.status(201).json({ user }); // Contained password hash

// After
const user = await prisma.user.create({
  data: {
    /* ... */
  },
  select: { id: true, email: true, name: true, role: true },
});
```

- **Engineering Reasoning:** Console output often pipes into persistent, non-secure aggregator tools (Datadog, CloudWatch). Keeping credentials strictly within Node's short-lived JS memory secures them against system-level observers.
- **Best Practice Applied:** PII Data Minimization and Log Sanitization.

### 🐛 3. Weak JWT Validation Signature

- **Category:** Security
- **Severity:** Critical
- **Root Cause Analysis:** The `authenticate` middleware incorrectly initialized `jwt.verify()` with `{ ignoreExpiration: true }`. This stripped zero-trust integrity, allowing previously extracted tokens to permanently authenticate.
- **The Fix:** Stripped the `ignoreExpiration` attribute, explicitly forcing token rotation constraints.

```javascript
// Before
const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true });

// After
const decoded = jwt.verify(token, JWT_SECRET);
```

- **Engineering Reasoning:** System security must treat sessions as ephemeral. Ignoring expiries permanently authenticates a compromised token.
- **Best Practice Applied:** Ephemeral Token Lifecycle / Strict Verification.

### 🐛 4. Ineffective Route Access Control (Admin Roles)

- **Category:** Security
- **Severity:** Critical
- **Root Cause Analysis:** The `authorizeAdminOnlyLegacy` middleware verified users were authenticated but bypassed their specific structural authorization role check. Thus, any verified user context could invoke catastrophic actions meant exclusively for `ADMIN`.
- **The Fix:** Re-implemented strict role authorization guard logic.

```javascript
// Before
// if (req.user.role !== 'ADMIN') return res.status(403).json(...);

// After
if (req.user.role !== "ADMIN") {
  return res.status(403).json({ error: "Access denied. Admin only." });
}
```

- **Engineering Reasoning:** Authorization must be explicit matching. Removing explicit guard rails exposes destructive mutability to unprivileged operational units.
- **Best Practice Applied:** Role-Based Access Control (RBAC).

---

## 🛡️ Priority 2: Data Integrity & Concurrency

### 🐛 5. Double Booking Physician Schedules

- **Category:** Data Integrity
- **Severity:** High
- **Root Cause Analysis:** Database constraints didn't block overlapping bookings for the same doctor. Validation fell onto express logic, which incorrectly evaluated whether the arbitrary requested millisecond matched an existing appointment.
- **The Fix:** Enforced strict collision constraints directly to PostgreSQL via Prisma schema updates. Updated POST route to cleanly catch standard error `P2002`.

```prisma
// Before
model Appointment {
  doctorId        String
  appointmentDate DateTime
}

// After
model Appointment {
// ...
  @@unique([doctorId, appointmentDate])
}
```

- **Engineering Reasoning:** Application-layer constraint validation fails sequentially under multiple node microservice processes (Distributed Race Condition). Pushing validation down to the database enforces guaranteed serialized atomicity.
- **Best Practice Applied:** Relational Integrity Constraints.

### 🐛 6. Broken Duplicate Check-in Queues

- **Category:** Concurrency
- **Severity:** High
- **Root Cause Analysis:** Receptionists generating check-in tokens simultaneously calculated the "next" token by fetching a `_max` payload independently. As load scaled, they shared identical aggregation peaks, allocating identical tokens for different patients.
- **The Fix:** Enveloped the maximum check and generation sequence within a `prisma.$transaction`. We utilized an explicit raw query blocking lock `SELECT 1 FROM Doctor FOR UPDATE` to serialize these distinct requests perfectly.

```javascript
// Before
const maxTokenResult = await prisma.queueToken.aggregate({ ... });
const newToken = await prisma.queueToken.create({ ... });

// After
const newToken = await prisma.$transaction(async (tx) => {
  await tx.$executeRaw`SELECT 1 FROM "Doctor" WHERE id = ${doctorId} FOR UPDATE`;
  const maxTokenResult = await tx.queueToken.aggregate({ ... });
  return await tx.queueToken.create({ ... });
});
```

- **Engineering Reasoning:** Transactions with `FOR UPDATE` strictly block subsequent reads for the requested resource until completion. This locks sequence logic efficiently.
- **Best Practice Applied:** Atomic Optimistic Concurrency Control.

---

## 🚀 Priority 3: Backend Performance

### 🐛 7. System-Blocking N+1 Queries

- **Category:** Performance
- **Severity:** High
- **Root Cause Analysis:** `GET /appointments` individually iterated across hundreds of returned appointment payloads, executing separate, individual sequential reads to collect Doctor and Patient properties (`findUnique`).
- **The Fix:** Leveraged Prisma `include` functionality for multi-relational expansion under one query payload path.

```javascript
// Before
for (const app of appointments) {
  const patient = await prisma.patient.findUnique({
    where: { id: app.patientId },
  });
}

// After
const detailedAppointments = await prisma.appointment.findMany({
  where,
  include: {
    patient: { select: { id: true, name: true } },
    doctor: { select: { id: true, specialization: true } },
  },
});
```

- **Engineering Reasoning:** Compiling sequential connections strains database CPU connections significantly, yielding high latency responses. Utilizing ORM relationships generates highly-structured JOIN mapping.
- **Best Practice Applied:** JOIN/Batch Data Fetching.

### 🐛 8. Non-blocking Parallel Execution Stagnation

- **Category:** Performance
- **Severity:** Medium
- **Root Cause Analysis:** Admin `stats` endpoints relied heavily on serial independent queries (`totalDoctors`, `surgeonsCount`). This blocks Node.js's I/O event thread, accumulating total baseline latency sequentially.
- **The Fix:** Refactored awaited queries to fire simultaneously via arrays evaluated concurrently by `Promise.all`.

```javascript
// Before
const totalDoctors = await prisma.doctor.count();
const surgeonsCount = await prisma.doctor.count({ ... });

// After
const [totalDoctors, surgeonsCount] = await Promise.all([
  prisma.doctor.count(),
  prisma.doctor.count({ ... })
]);
```

- **Engineering Reasoning:** Firing standalone aggregations in parallel massively drops cumulative API turnaround speeds against PostgreSQL IO.
- **Best Practice Applied:** Concurrent Promise Execution.

### 🐛 9. In-Memory Frontend Pagination Memory Spikes

- **Category:** Performance
- **Severity:** High
- **Root Cause Analysis:** The patient records endpoint requested and loaded the absolute entirety of the `Patient` table payload into system RAM to map `slice(0, 5)`. Over scale, pulling millions of tuples strictly crashes memory allocation headers.
- **The Fix:** Delegated limiting responsibilities seamlessly to PostgreSQL SQL sequences utilizing Prisma's `skip` and `take` variables with native pagination architectures.

```javascript
// Before
const allPatients = await prisma.patient.findMany();
const paginatedResult = allPatients.slice(offset, offset + limit);

// After
const paginatedResult = await prisma.patient.findMany({
  take: limit,
  skip: offset,
});
```

- **Engineering Reasoning:** The database handles subselection significantly more appropriately than mapping huge blobs onto volatile NodeJS heap memories. Only absolute required JSON data passes via the microservice API proxy.
- **Best Practice Applied:** Database Cursor Pagination (LIMIT/OFFSET).

---

## 🎨 Priority 4: Frontend Stability & Missing Workflows

### 🐛 10. Dashboard Crash (Null Chaining) & Missing Polling Cleans

- **Category:** Frontend Stability
- **Severity:** Critical
- **Root Cause Analysis:** Two debilitating errors existed. First, React continuously initialized overlapping background `Intervals` upon `/queue` rendering, crashing browser contexts aggressively due to memory saturation. Secondly, parsing strings without nullable structural paths (`.toUpperCase()`) broke routing directly when Patient medical data registered as `null`.
- **The Fix:** Structured rigorous `clearInterval()` boundaries via React's memory cleanup pipeline. Implemented Safe Native Optional Chaining in `page.js`. We also introduced 300ms Debouncing patterns for key inputs to block redundant network rendering calls.

```javascript
// Before
setInterval(() => {
  fetchQueueData();
}, 3000);
<p>{selectedPatientHistory.medicalHistory.toUpperCase()}</p>;

// After
const timer = setInterval(() => fetchQueueData(), 3000);
return () => clearInterval(timer);

<p>
  {selectedPatientHistory.medicalHistory?.toUpperCase() ||
    "NO CLINICAL HISTORY ON FILE"}
</p>;
```

- **Engineering Reasoning:** Properly de-allocating unmounted JS events avoids exponential RAM leaks. Applying logical parameter checks avoids React `ErrorBoundary` crashes entirely when properties hold unresolved metadata structure types.
- **Best Practice Applied:** Javascript Event De-allocation, Safe Chaining Operators, & Search Debouncing.

### ✨ Bonus Deliverable: New Patient History Record Portal

Engineered `/patients/[id]/history-records/page.js` to ingest, load, and dynamically format deep clinical summaries as standard Next.js architecture (preventing generic HTTP `404` errors). It leverages SSR metadata injection mapping while presenting previous physician responses logically.

# PRD: Hospital Management System

## Problem Statement

Hospitals operating across multiple branches lack an integrated platform to manage public-facing content (website, doctor listings, health packages), clinical operations (appointments, patient registration, OPD/IPD episodes, consultations, pharmacy, billing), and specialized workflows (lab testing, radiology/imaging). Data is siloed across disparate systems, forcing staff to toggle between tools and re-enter information. Patients cannot access their own records, book appointments online, or receive digital reports. Hospital leadership lacks a unified view of revenue, patient flow, and operational KPIs.

## Solution

A single-page application (SPA) integrated healthcare platform delivered as a monorepo, with a Laravel backend organizing business logic into bounded contexts and a React frontend providing a unified staff/patient/management interface. A single MySQL database with schema-level separation per bounded context supports multi-hospital and multi-branch operations. The platform replaces disconnected tools with one integrated system covering the public website (CMS), hospital operations (BPR), laboratory workflows (LIS), and radiology/imaging (RIS/PACS).

## Tech Stack

- **Backend**: Laravel (PHP) — modular monolith with bounded contexts organized as Laravel modules
- **Frontend**: React — single-page application consuming the Laravel JSON API
- **Database**: MySQL — single instance with schema-per-bounded-context or separate databases per context
- **Repository**: Monorepo — single repository containing both backend and frontend code

## User Stories

1. As a patient/visitor, I want to browse the hospital website (departments, doctors, services, health packages, blogs, news, FAQ), so that I can learn about the hospital and its offerings.
2. As a patient, I want to search for doctors by name, specialty, or department, so that I can find the right doctor for my condition.
3. As a patient, I want to book an appointment with a doctor online by selecting a date and time slot, so that I can visit the hospital without queuing.
4. As a patient, I want to view my upcoming and past appointments, so that I can manage my schedule.
5. As a patient, I want to receive appointment confirmation and reminders via email or SMS, so that I don't miss my visit.
6. As a patient, I want to view my medical records, prescriptions, lab reports, and radiology reports through a patient portal, so that I can access my health information anytime.
7. As a patient, I want to view and pay my bills online, so that I can settle payments conveniently.
8. As a patient, I want to submit inquiries through the hospital website's contact/FAQ section, so that I can get answers to my questions.
9. As a receptionist, I want to register a new patient with their demographic details and contact information, so that they receive a unique Patient ID.
10. As a receptionist, I want to search for an existing patient by name, phone, or Patient ID, so that I can avoid duplicate registrations.
11. As a receptionist, I want to convert a walk-in patient into an OPD Episode of Care, so that the clinical workflow can begin.
12. As a receptionist, I want to confirm or reschedule appointments at the desk, so that the daily schedule stays accurate.
13. As a doctor, I want to view my appointment schedule for the day, so that I know which patients to expect.
14. As a doctor, I want to start a Consultation for a patient within their Episode of Care, so that I can document clinical findings.
15. As a doctor, I want to record clinical notes, diagnosis, and treatment plan during a Consultation, so that the patient's EMR is updated.
16. As a doctor, I want to prescribe medications during a Consultation, so that the pharmacy can dispense them.
17. As a doctor, I want to place lab orders (to LIS) during a Consultation, so that the lab can collect samples and process tests.
18. As a doctor, I want to place radiology/imaging orders (to RIS/PACS) during a Consultation, so that imaging can be scheduled and performed.
19. As a doctor, I want to view lab results and radiology reports within the patient's EMR, so that I can make informed clinical decisions.
20. As a nurse, I want to record vital signs and nursing observations for an IPD patient, so that their condition is tracked over time.
21. As a nurse, I want to view the ward census and bed occupancy, so that I know which patients are where.
22. As a nurse, I want to transfer a patient between wards or beds, so that bed utilization is optimized.
23. As a nurse, I want to administer medications as prescribed and record administration, so that the medication chart is accurate.
24. As a laboratory technician, I want to receive lab orders from BPR, so that I know which tests to process.
25. As a laboratory technician, I want to collect and accession samples with unique barcodes, so that samples are traceable.
26. As a laboratory technician, I want to enter test results manually or through instrument integration, so that results are accurate and timely.
27. As a laboratory technician, I want to validate and release test results, so that doctors receive finalized reports.
28. As a radiologist, I want to receive imaging orders from BPR, so that I can schedule modalities and acquire images.
29. As a radiologist, I want to view and annotate DICOM images, so that I can produce a diagnostic report.
30. As a radiologist, I want to dictate, sign, and release radiology reports, so that referring doctors receive the findings.
31. As a pharmacist, I want to receive prescriptions from doctor Consultations, so that I can dispense medications.
32. As a pharmacist, I want to verify the prescription against drug inventory before dispensing, so that stock levels are maintained.
33. As a pharmacist, I want to record dispensed medications against the patient's Episode of Care, so that billing captures drug costs.
34. As an inventory manager, I want to manage drug stock levels with expiry tracking and reorder alerts, so that pharmacy never runs out of essential medicines.
35. As an inventory manager, I want to manage non-drug inventory (consumables, equipment, instruments), so that all hospital supplies are tracked.
36. As an accountant, I want to generate bills per Episode of Care with line items (consultation fees, drugs, lab tests, imaging, ward charges), so that patients are charged accurately.
37. As an accountant, I want to process payments (cash, card, eSewa, Khalti, ConnectIPS, FonePay) against a bill, so that revenue is collected.
38. As an accountant, I want to apply insurance coverage to a bill, so that the patient pays only their share.
39. As an insurance staff member, I want to look up a patient's insurance policy and verify coverage, so that claims can be processed.
40. As an HR/admin, I want to manage staff profiles, department assignments, schedules, and attendance, so that staffing levels meet operational needs.
41. As an IT administrator, I want to manage users, roles, and permissions, so that staff access is appropriate to their role.
42. As a system administrator, I want to configure multi-hospital and multi-branch settings, so that the platform serves the entire organization.
43. As a hospital administrator, I want to view dashboards with KPIs (patient volume, revenue, occupancy rate, average wait time), so that I can monitor operational performance.
44. As a hospital administrator, I want to generate reports (financial, clinical, operational), so that I can make data-driven decisions.
45. As a content manager, I want to create and publish website pages, doctor listings, blogs, news, and health packages through the CMS, so that the public website is up to date.
46. As a content manager, I want to manage SEO metadata and media gallery (images, videos), so that the website is discoverable and engaging.
47. As a content manager, I want to manage FAQ and patient inquiries, so that visitors can find answers quickly.
48. As a visitor, I want to register for a patient portal account with my email and phone number, so that I can access online services.
49. As a user, I want to log in to the platform using my email and password, so that I can access my authorized features.
50. As a user, I want to verify my email address after registration via a verification link, so that my account is secure and confirmed.
51. As a user, I want to verify my phone number via OTP during registration, so that I can receive SMS notifications securely.
52. As a user, I want to request a password reset email if I forget my password, so that I can regain access to my account.
53. As a user, I want to reset my password using a secure token from my email, so that my account remains protected.
54. As a user, I want to receive an OTP for sensitive actions (password change, profile update), so that my account is protected from unauthorized changes.
55. As a user, I want to view and edit my profile (name, email, phone, avatar, contact details), so that my information stays current.
56. As a user, I want to change my password from within my profile settings, so that I can maintain account security.
57. As a user, I want to configure my notification preferences (email, SMS, in-app), so that I receive alerts in my preferred channels.
58. As a user, I want to view the public hospital homepage with hospital info, services, departments, featured doctors, and health packages, so that I can learn about the hospital before engaging.
59. As an authenticated user, I want to see a role-based dashboard homepage after login, so that I can quickly access my most relevant tasks and data.
60. As a user, I want to send and receive internal messages with other platform users (staff-to-staff, staff-to-patient), so that I can communicate within the platform instead of external tools.
61. As a user, I want to view a threaded message conversation with replies, so that I can follow the context of discussions.
62. As a user, I want to receive in-app notifications (bell icon dropdown), so that I can see real-time alerts without leaving the platform.
63. As a user, I want to view a list of my past notifications and mark them as read, so that I can track what I've already seen.
64. As an administrator, I want to view the system activity log with user, action, timestamp, IP address, and entity details, so that I can audit system usage and investigate issues.
65. As an administrator, I want to filter and search the activity log by user, date range, action type, and module, so that I can quickly find relevant audit entries.
66. As a user, I want to use global search across the platform to find patients, doctors, appointments, and records, so that I can navigate efficiently without browsing menus.
67. As a user, I want to access system settings (notification channels, theme preferences, language), so that I can customize my experience.
68. As an administrator, I want to configure system-wide settings (hospital name, logo, contact info, module toggles, OTP requirements), so that the platform is configurable without code changes.

## Implementation Decisions

### Monorepo Structure

```
hospital-management/
├── backend/                  # Laravel application
│   ├── app/
│   │   ├── Modules/
│   │   │   ├── Platform/     # Platform / Auth / Shared Services
│   │   │   │   ├── Auth/     # Register, login, password reset, email verification, OTP
│   │   │   │   ├── User/     # User profiles, roles, permissions, settings
│   │   │   │   ├── Message/  # Internal messaging between users
│   │   │   │   ├── Notification/  # In-app, email, SMS notifications
│   │   │   │   ├── ActivityLog/   # Audit trail
│   │   │   │   └── Search/   # Global search
│   │   │   ├── CMS/          # Content Management System
│   │   │   ├── BPR/          # Business Process / Operations
│   │   │   │   ├── Appointment/
│   │   │   │   ├── PatientManagement/
│   │   │   │   ├── OPDIPD/
│   │   │   │   ├── Consultation/
│   │   │   │   ├── Pharmacy/
│   │   │   │   ├── Billing/
│   │   │   │   ├── Inventory/
│   │   │   │   └── HR/
│   │   │   ├── LIS/          # Laboratory Information System
│   │   │   └── RIS-PACS/     # Radiology / Imaging
│   │   └── ...
│   ├── config/
│   ├── database/
│   │   ├── migrations/       # Per-module migrations
│   │   └── seeds/
│   └── routes/
│       ├── api/
│       │   ├── platform.php  # Auth, users, messages, notifications, activity log
│       │   ├── cms.php
│       │   ├── bpr.php
│       │   ├── lis.php
│       │   └── ris-pacs.php
│       └── web.php
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── modules/
│   │   │   ├── platform/    # Login, register, profile, settings, messages, notifications
│   │   │   ├── cms/
│   │   │   ├── bpr/
│   │   │   ├── lis/
│   │   │   ├── ris-pacs/
│   │   │   └── shared/      # Shared UI components, API client, hooks
│   │   ├── layouts/
│   │   │   ├── PublicLayout/  # Public homepage, login, register
│   │   │   └── AuthenticatedLayout/  # Sidebar, topbar, role-based navigation
│   │   └── App.tsx
│   └── package.json
├── packages/                 # Shared libraries (if any)
└── docker/                   # Docker configuration
```

### Bounded Contexts and Their Boundaries

**CMS** — Owns all public-facing content: hospital profile, department/service listings (referencing BPR by ID), website pages, blogs, news, health packages, media gallery, FAQ, SEO metadata. Does not own patient or operational data.

**BPR** — Owns hospital operations. Internal sub-domains communicate via in-process Laravel events/services, not HTTP. Cross-context communication with LIS and RIS/PACS uses event-driven messaging (Laravel events + queue) — BPR emits `LabOrderPlaced`, `ImagingOrderPlaced`; LIS and RIS/PACS consume these and return results via their own events.

**LIS** — Separate bounded context with its own domain rules for sample lifecycle (ordered → collected → accessioned → in-progress → validated → released). Does not share a database with BPR. Communicates via events/queue.

**RIS/PACS** — Separate bounded context for imaging workflows. Image storage (DICOM) uses dedicated storage; structured reports are returned to BPR via events. May be decomposed into RIS (workflow/reporting) and PACS (image storage/retrieval) as tightly-coupled sub-contexts.

### Platform / Auth Module (Shared Services)

A single Platform module owned as infrastructure, not a bounded context with its own domain language. All other modules consume it.

**Authentication & Account Management** (`Platform/Auth`)

- **Register** — self-registration for patients (name, email, phone, password). Staff accounts created by admin only.
- **Login** — email/password authentication using Laravel Sanctum for SPA token-based sessions. Role-based redirect after login.
- **Email Verification** — verification link sent on registration. Protected routes blocked until verified.
- **Phone Verification** — OTP sent via SMS for phone number confirmation.
- **Forgot Password** — email-based flow with secure token, expiration, and Laravel notifications.
- **Reset Password** — token verification + new password submission. Token single-use with expiry.
- **OTP for Sensitive Actions** — OTP sent to verified email/phone for actions: password change, profile email change, high-value billing operations. Configurable per action type.

**User Profile & Settings** (`Platform/User`)

- **Profile** — view/edit own profile (name, email, phone, avatar upload). Change password with current password confirmation.
- **Settings** — notification preferences (email on/off, SMS on/off, in-app on/off), theme preference, language preference.
- **System Settings** — admin-only: hospital name, logo, contact info, module enable/disable, OTP requirement toggles.

**Internal Messaging** (`Platform/Message`)

- Threaded conversations between platform users (staff-to-staff, doctor-to-patient, admin-to-staff).
- Messages are scoped to a hospital/branch. Attachments supported.
- Conversations can reference entities (e.g., link message to a specific Patient or Episode of Care).
- Read/unread tracking, reply threading.

**Notifications** (`Platform/Notification`)

- **In-app** — bell icon dropdown with real-time badge count. List of all notifications with read/unread state.
- **Email** — transactional emails (appointment confirmation, lab results ready, password reset, welcome email) via Laravel Mail.
- **SMS** — OTP, appointment reminders, critical alerts via SMS gateway integration.
- Notification types are defined per module (BPR emits "appointment reminder", LIS emits "results ready"). Platform/Notification is the delivery channel, not the source.

**Activity Log** (`Platform/ActivityLog`)

- Automatic audit trail via Laravel model event observers. Captures: user, action (created/updated/deleted/restored), entity type, entity ID, changed attributes (old vs new), IP address, user agent, timestamp.
- Actions are recorded in human-readable format for display.
- Searchable and filterable by: user, date range, action type, module, entity type.
- Immutable — logs cannot be deleted or edited. Retention policy configurable.

**Search** (`Platform/Search`)

- Global search bar accessible from any authenticated page.
- Results aggregated across modules: patients, doctors, appointments, episodes, lab reports, content pages.
- Filter search to specific module. Results link directly to the relevant entity page.
- Powered by MySQL full-text search in initial build; upgradable to Laravel Scout/Meilisearch later.

**File & Media Service** — Laravel Storage (local or S3-compatible) for documents, images, profile avatars, DICOM.

**Cache Service** — Laravel cache (Redis or file-based).

### Database Strategy

A single MySQL instance with logical separation:
- Each bounded context uses its own database or set of prefixed tables
- Cross-context references use external IDs (e.g., BPR tables reference `patient_id`; LIS tables reference `patient_id` as a foreign key to the Patient identity, not to the BPR schema)
- Migrations are organized per module

### API Design

- Laravel JSON API (RESTful) with versioned routes (`/api/v1/...`)
- Each bounded context exposes its own route group
- React SPA consumes APIs via shared API client layer (axios)
- API Gateway pattern in production for rate limiting, authentication, routing

### Multi-Hospital and Multi-Branch

- `hospital_id` and `branch_id` scoped across all entities
- Data isolation at query level — staff from Hospital A cannot access Hospital B data
- Branch is a physical location within a hospital; appointment and episode scoping includes branch context

## Testing Decisions

- **Each bounded context is tested independently** via Laravel feature tests against its public API. Tests cover the external contract of each context — what goes in (request) and what comes out (response, database state, emitted events).
- **Cross-context integration tests** test the event-driven boundaries: place a lab order from BPR → assert LIS receives the `LabOrderPlaced` event → assert results returned and consumable by BPR.
- **Domain logic unit tests** test critical calculations (billing, drug interaction checks, appointment slot availability) without HTTP or database.
- **React frontend tests** use React Testing Library at the component level, testing user interactions and API contract compliance (fixtures matching the Laravel API response shapes).
- No end-to-end browser tests in the initial build — the API contract + integration tests provide sufficient coverage at this stage.

## Out of Scope

- Telemedicine / remote consultation integration (future phase)
- Government health system integration (future phase)
- Accounting system integration (Tally, Busy — future phase)
- Mobile native apps (iOS/Android) — the React SPA is responsive but a native app is a separate effort
- Real-time DICOM viewer in the browser — PACS viewer is a specialized component for later
- Multi-language and multi-currency support are architectural considerations but not implemented in the initial build
- CI/CD pipeline configuration

## Further Notes

- The PRD references the domain glossary in `CONTEXT.md` — all terms (Patient, Episode of Care, Appointment, Consultation, CMS, BPR, LIS, RIS/PACS) use the definitions established there.
- This project follows a bounded context architecture. Teams can be organized per context. Contexts that are not yet built (LIS, RIS/PACS) can be stubbed with mock implementations to unblock BPR development.

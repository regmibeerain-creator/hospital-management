# Implementation Plan: Hospital Management System

Phased delivery based on the PRD, organized by dependency order. Each phase is a usable vertical slice.

---

## Phase 1: Foundation & Auth

*Monorepo scaffold, Laravel + React boilerplate, MySQL schema*

**Backend**
- Monorepo structure with `backend/` (Laravel) and `frontend/` (React)
- Docker setup (PHP, MySQL, Node, Mailhog)
- Platform/Auth — Register, Login, Logout, Email verification, Forgot/Reset password, OTP
- Platform/User — Profile (view/edit), avatar upload, change password, notification preferences
- Platform/ActivityLog — Model event observers, audit trail (user, action, entity, IP, timestamp)
- RBAC — Role definition, permission gates, admin/user/staff roles
- System settings table (hospital name, logo, contact, module toggles)

**Frontend**
- PublicLayout (unauthenticated — login, register, forgot password pages)
- AuthenticatedLayout (sidebar, topbar, user menu, role-based navigation)
- Login page, Register page, Forgot/Reset password page, Profile page, Settings page
- Shared API client (axios interceptors, auth token management)
- Shared UI component library (buttons, inputs, modals, tables, forms)

**Database**
- Platform schema: `users`, `password_reset_tokens`, `personal_access_tokens`, `activity_logs`, `roles`, `permissions`, `settings`

**Deliverable:** Working auth system. Staff can register, log in, manage profile. Activity is tracked.

---

## Phase 2: CMS — Public Website

*Standalone — can be built in parallel with Phase 1*

**Backend (CMS Module)**
- Hospital profile (name, logo, about, contact info, social links)
- Department & service listings (references BPR/HR department IDs)
- Doctor public listings (references BPR/Staff IDs, with CMS-specific bio, photo, education)
- Blog & news management (CRUD, publish/draft scheduling, categories)
- FAQ management (categories, questions, answers)
- Contact/inquiry form (public submission → admin notification)
- Media gallery (image upload, folders, captions)
- SEO metadata per page (title, description, keywords, og tags)
- Health packages — marketing content (name, description, price, included services, validity, featured image)

**Frontend (CMS Module)**
- Public homepage — hero, services, featured doctors, packages, blog preview
- Department listing/detail pages
- Doctor listing/detail pages (with CMS-specific bio content)
- Blog listing/detail pages
- FAQ page with category accordion
- Contact page with form
- Media gallery page
- Health packages listing/detail
- CMS admin screens — page editor, blog editor, media manager, SEO fields

**Deliverable:** Full public hospital website with CMS admin. Content managers can publish and manage all public-facing content.

---

## Phase 3: Core BPR — Patients, Staff & Appointments

**Backend (BPR Modules)**
- BPR/HR — Staff management (create, edit, roles, departments, schedules, status)
- Department management (name, code, description, head of department)
- BPR/PatientManagement — Patient registration (name, phone, email, address, DOB, gender, emergency contact, blood group)
- Patient unique ID generation (configurable format per hospital)
- Patient search (by name, phone, ID), duplicate detection
- Patient document upload (identity proof, insurance card, reports)
- BPR/Appointment — Doctor availability/time slot management
- Appointment booking (patient select → doctor + date → time slot → confirm)
- Appointment reschedule, cancel, check-in
- Calendar view (daily/weekly doctor schedules)
- Platform/Notification — Email + SMS for appointment confirmation and reminders (scheduled queue)
- Activity Log integration for all entity changes

**Frontend (BPR Module)**
- Receptionist dashboard — Today's schedule, pending check-ins
- Patient registration form (with search-first to avoid duplicates)
- Patient profile page (demographics, documents, visit history)
- Appointment booking form (doctor selector, date picker, slot grid)
- Appointment calendar view
- Staff management screens (admin)
- Department management screens

**Deliverable:** Front desk can register patients, book appointments, check in walk-ins. Patients receive confirmations.

---

## Phase 4: OPD Clinical & Pharmacy

**Backend (BPR Modules)**
- BPR/Clinical — Episode of Care creation (OPD) from appointment check-in or walk-in
- Consultation start/end — Doctor opens a consultation for an Episode
- Clinical notes (subjective, objective, assessment, plan — SOAP format)
- Diagnosis recording (ICD code lookup + free text)
- Lab order placement (emit `LabOrderPlaced` event for LIS)
- Imaging order placement (emit `ImagingOrderPlaced` event for RIS/PACS)
- BPR/Pharmacy — Drug catalog (name, generic name, strength, form, manufacturer)
- Drug inventory (batch, quantity, expiry, reorder level, purchase price, selling price)
- Prescription: doctor prescribes → pharmacy receives → pharmacist verifies → dispenses
- BPR/Nursing — Vital signs (BP, pulse, temperature, respiratory rate, SpO2, height, weight)
- Care notes (nursing observations within Episode)
- Platform/Notification — Lab ready, prescription ready, imaging ready alerts

**Frontend (BPR Module)**
- Doctor dashboard — Today's patient list, active consultations, pending results
- Consultation screen — SOAP notes, diagnosis, prescriptions, lab/imaging orders
- Lab ordering interface — Select tests from catalog, add to order
- Imaging ordering interface — Select modality, add notes
- Pharmacist dashboard — Pending prescriptions queue
- Dispensing screen — Verify script, select batch, dispense quantity
- Drug inventory management screens
- Vital signs entry form
- Nursing notes entry form

**Deliverable:** Doctor can consult patients, document notes, prescribe drugs, order tests. Pharmacy can dispense.

---

## Phase 5: Billing, Insurance & Inventory

**Backend (BPR Modules)**
- BPR/Billing — Bill generation per Episode of Care
- Auto-populate line items from: consultation fee, dispensed drugs, lab orders, imaging orders, ward charges
- Manual line item add/adjust (discounts, surcharges)
- Payment processing — Cash, Card, eSewa, Khalti, ConnectIPS, FonePay
- Bill status: draft → waiting payment → paid → partially paid → void
- Invoice generation and PDF export
- BPR/Insurance — Insurance company/TPA master data
- Patient policy registration (policy number, coverage type, validity, limits)
- Coverage check against bill line items
- Insurance claim creation (link to bill, submit to TPA)
- Health package fulfillment — Record package purchase, mark as used per service, redeem against bill
- BPR/Inventory — Non-drug inventory catalog (consumables, instruments, equipment)
- Stock in/out, stock transfer between branches
- Asset register (purchase date, warranty, location, serial number)
- Equipment maintenance schedule and log

**Frontend (BPR Module)**
- Accountant dashboard — Daily revenue, pending bills, payment reconciliation
- Billing screen — View Episode, add items, apply discounts/insurance, generate bill
- Payment screen — Select payment method, record transaction
- Invoice PDF view/download
- Insurance policy registration form
- Insurance claim screen
- Inventory management screens (catalog, stock in/out, adjustments)
- Asset register and maintenance log screens

**Deliverable:** Full billing cycle. Bills generated from clinical activity, payments processed, insurance applied.

---

## Phase 6: IPD, Nursing & Ward Management

**Backend (BPR Modules)**
- BPR/Clinical — IPD Episode (admission from OPD or ER, planned admission)
- Admission workflow: assign ward, bed, primary doctor, admit date/time
- Discharge workflow: discharge summary, discharge date/time, bed release
- Transfer workflow: bed-to-bed, ward-to-ward, discharge notes on transfer
- Ward management — Ward master (name, code, type, location, floor)
- Bed management — Bed master (room number, bed number, bed type, status occupied/vacant/maintenance)
- Bed occupancy tracking (current patient, admission date, expected discharge)
- Nursing documentation — Full nursing notes (subjective, objective)
- Intake/output charting (oral, IV, urine, drain, etc.)
- Medication administration record (MAR) — Scheduled dose, administered time, nurse signature, missed dose reason
- ER triage workflow — Severity level (immediate, urgent, semi-urgent, non-urgent), triage notes
- ER fast-track to OPD or IPD admission
- Platform/Message — Internal messaging linked to Patient or Episode (nurse-to-doctor handover, shift notes)

**Frontend (BPR Module)**
- IPD admission screen
- Ward/bed visual map (occupancy view)
- Discharge planning screen
- Transfer order screen
- Nursing notes entry (with templates)
- Intake/output chart
- MAR screen — Scheduled doses, admin recording, missed dose reason
- ER triage screen
- Message inbox/compose with entity linking
- Nurse dashboard — Assigned patients, pending tasks, MAR schedule

**Deliverable:** Full IPD lifecycle, ward management, nursing documentation, ER triage.

---

## Phase 7: LIS (Laboratory Information System)

*Separate bounded context — event-driven communication with BPR*

**Backend (LIS Module)**
- Lab order reception (consumes `LabOrderPlaced` event from BPR)
- Sample management — Collect, barcode label, accession number, transport tracking
- Sample lifecycle states: ordered → collected → accessioned → in-progress → validated → released → rejected
- Test catalog — Test name, department, specimen type, reference ranges (gender/age-based), turnaround time
- Result entry — Manual entry form, bulk entry, instrument file import
- Validation workflow — Technician enters → Supervisor validates → Released
- Result amendment workflow (with audit trail)
- Instrument integration interface (HL7 or file-based)
- LIS dashboard — Pending collections, in-progress tests, results awaiting validation, turnaround time tracking
- `LabResultsReady` event emitted to BPR on release
- Activity Log for all lab entity changes

**Frontend (LIS Module)**
- Lab order list (all pending/received from BPR)
- Sample collection screen (barcode print, assign to technician)
- Result entry screen (with reference range display, flag abnormal values)
- Validation screen (review → approve → reject)
- Released results view
- Test catalog management screens
- Instrument integration configuration
- LIS dashboard — Workload, pending, TAT monitors
- Lab report PDF view/print

**Deliverable:** Complete lab workflow from order to validated result. Results delivered to BPR automatically.

---

## Phase 8: RIS/PACS (Radiology Information System)

*Separate bounded context — event-driven communication with BPR*

**Backend (RIS/PACS Module)**
- Imaging order reception (consumes `ImagingOrderPlaced` event from BPR)
- Modality scheduling — X-ray, CT, MRI, USG, Mammography — per modality calendar
- Order lifecycle: ordered → scheduled → acquired → reporting → signed → delivered
- DICOM image upload and storage (dedicated file storage, not MySQL)
- Structured report templates (findings, impression, recommendation per modality type)
- Radiologist reporting workflow — Claim study → dictate report → sign
- Report sign-off (single or double reading)
- Report delivery — `ImagingReportReady` event emitted to BPR
- RIS dashboard — Modality schedule, unreported studies, signed reports, turnaround time

**Frontend (RIS/PACS Module)**
- Imaging order list (all pending/received from BPR)
- Modality schedule screen (daily/weekly view per modality)
- Patient worklist per modality
- Report entry screen (structured template, free text)
- Report sign-off screen (review → e-sign → release)
- Signed reports view
- Report PDF view/print
- RIS dashboard — Schedule, unreported count, TAT monitors

*Note: Full DICOM viewer in-browser is out of scope for initial build. Images are stored and linked; viewing is via external DICOM viewer.*

**Deliverable:** Complete imaging workflow from order to signed report. Reports delivered to BPR automatically.

---

## Phase 9: Admin, Reports & Search

**Backend (Platform/Search + BPR/Reporting)**
- Platform/Search — Global search index built from all modules
- MySQL full-text search across: patients, doctors, appointments, episodes, lab reports, radiology reports, CMS content
- Search result ranking and filtering by module
- Search links directly to entity detail pages
- BPR/Reporting — Reporting data sources (aggregated queries per module)
- Financial reports: revenue per day/week/month, payment method breakdown, outstanding bills
- Clinical reports: patient volume (OPD/IPD/ER), diagnosis frequency, readmission rate
- Operational reports: bed occupancy rate, appointment no-show rate, average wait time, lab TAT, pharmacy turnover
- Export: PDF, CSV, Excel
- Management dashboard — Real-time KPI cards, trend charts, comparative period analysis
- System settings — Admin panel: hospital/branch configuration, module enable/disable, OTP requirements, notification defaults
- Multi-hospital admin — Switch hospital context, consolidated cross-hospital reports (for central admin)
- Platform/Search results include hospital/branch scope

**Frontend (Platform + BPR Module)**
- Global search bar (available in AuthenticatedLayout header)
- Search results page (grouped by module, filterable)
- Management dashboard — KPI cards, charts, date range selector
- Reports screen — Report type selector, filters, preview, export
- System settings screens (admin only)
- Multi-hospital switcher (central admin only)

**Deliverable:** Full system visibility. Leadership can monitor KPIs, generate reports, search globally. Admin can configure the platform.

---

## Dependency Graph

```
Phase 1 (Foundation & Auth)
  ├── Phase 2 (CMS) — independent, can be parallel
  │
  └── Phase 3 (Patients, Staff, Appointments)
        │
        └── Phase 4 (OPD Clinical + Pharmacy)
              │
              ├── Phase 5 (Billing, Insurance, Inventory)
              │
              ├── Phase 6 (IPD, Nursing, Ward)
              │
              ├── Phase 7 (LIS) — independent of Phase 5-6
              │
              └── Phase 8 (RIS/PACS) — independent of Phase 5-6
                    │
                    └── Phase 9 (Admin, Reports, Search)
                          └── depends on data from all prior phases
```

Phases 1–4 deliver core operational value (patient → appointment → consultation → dispense). Phases 5–8 add revenue, inpatient, lab, and radiology — each can be parallelized after Phase 4. Phase 9 caps the system with visibility and administration.

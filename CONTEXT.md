# Birendranagar Municipal Hospital

An integrated healthcare platform for multi-hospital and multi-branch operations, combining hospital website CMS, HMS, EMR, LIS, RIS/PACS, pharmacy, billing, insurance, HR, inventory, and analytics.

## Language

**Patient**:
A person receiving medical care, uniquely identified across the entire system. The single source of truth for patient identity lives in the Patient Database; clinical/EMR data is a separate projection keyed to the same Patient identity.
_Avoid_: Client, customer, user, person

**Patient Management**:
The bounded context that owns patient identity — registration, demographics, unique ID lifecycle, contact info, and document uploads. Creates and maintains the Patient record.
_Avoid_: Patient registration (too narrow), Patient administration

**Episode of Care**:
A single encounter or stay for a Patient — an OPD visit, an IPD admission, or an ER encounter. Owned by OPD/IPD Management. An Episode is *for* a Patient but is not the Patient itself.
_Avoid_: Visit, admission, encounter (when the generic term is insufficient)

**Appointment**:
A reservation of a time slot with a doctor, scheduled in advance. An Appointment may convert into an Episode of Care when the patient arrives; walk-ins create an Episode without an Appointment.
_Avoid_: Booking, reservation (when Appointment is the specific term)

**CMS (Content Management System)**:
The bounded context that manages public-facing hospital content — website pages, doctor listings, services, blogs, news, health packages, media gallery, FAQ, SEO. Owns what the public sees; references operational data (departments, doctors) from BPR by ID.
_Avoid_: Website admin, public portal

**BPR (Business Process / Operational Modules)**:
The bounded context that owns hospital operations — appointments, patient identity, OPD/IPD episodes, consultations, pharmacy, billing, inventory, HR. The source of truth for clinical and operational data. BPR places orders to LIS and RIS/PACS but does not own lab or radiology domain data.
_Avoid_: Backend system, operations

**LIS (Laboratory Information System)**:
A separate bounded context that manages lab workflows — sample collection, accessioning, processing, quality control, result entry, instrument integration. Receives lab orders from BPR; returns structured results.
_Avoid_: Lab module, lab subsystem

**RIS/PACS (Radiology Information System / Picture Archiving and Communication System)**:
A separate bounded context (or two tightly-coupled contexts) that manages imaging workflows — modality scheduling, image acquisition, DICOM storage, reporting, and result distribution. Receives imaging orders from BPR; returns images and reports.
_Avoid_: Radiology module, imaging subsystem

**Consultation**:
A clinical encounter between a doctor and a Patient within an Episode of Care. Produces clinical data (notes, diagnosis, prescriptions, lab/imaging orders) that feeds the EMR. An Episode may have one or more Consultations.
_Avoid_: Doctor visit, checkup, clinical encounter

**User**:
A platform login account identified by email and password. Any person (staff or patient) can be a User. A User may link to zero or one Staff record and zero or one Patient record; the same person acting as both staff and patient has a single User account with dual linkage.
_Avoid_: Account, login

**Staff**:
A hospital employee with a role (doctor, nurse, receptionist, etc.), department assignment, and schedule. Linked to a User account for system access. Created and managed by HR within BPR.
_Avoid_: Employee, worker

**Health Package**:
A pre-defined bundle of services (consultations, lab tests, imaging) sold at a single price. CMS owns the marketing description; BPR owns the sale, fulfillment, and billing when a Patient purchases one.
_Avoid_: Offer, plan, service bundle

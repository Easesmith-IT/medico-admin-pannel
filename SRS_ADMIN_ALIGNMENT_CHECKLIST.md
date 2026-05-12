# Medico Admin Panel - SRS Alignment Checklist

Source SRS:
- `C:\Users\kunal\Downloads\Medico app SRS.pdf`
- Normalized doc: `E:\easesmith\medico\medico_backend\MEDICO_APP_SRS.md`

Scope of this checklist:
- Align only the **Admin Panel (Web Interface)** requirements from SRS with current `medico-admin-pannel` implementation.
- Classify each module as `Implemented`, `Partial`, or `Missing`.
- Provide actionable checklist items for implementation.

Status legend:
- `Implemented`: module is operational and wired to backend APIs.
- `Partial`: some pieces exist, but core SRS behavior is incomplete.
- `Missing`: module is absent or only mock/static.

---

## 1) Authentication, Access Control, and Admin Governance
Current status: `Partial`

Evidence in code:
- Login + cookie auth flow exists: `src/app/(auth)/(login)/page.jsx`, `src/proxy.js`
- Admin listing/add/toggle exists: `src/app/admin/admins/page.jsx`, `src/app/admin/admins/add/page.jsx`, `src/components/admin/admin.jsx`
- Permission gate in middleware is currently commented out: `src/proxy.js`

Checklist:
- [x] Admin login UI and backend auth integration
- [x] Protected `/admin/*` routing via middleware auth check
- [x] Sub-admin create/list/status toggle
- [ ] Enforce route-level RBAC in middleware using `userInfo.permissions`
- [ ] Add admin edit/delete workflows with permission guards
- [ ] Add session/device management (forced logout, token/session revocation)
- [ ] Add admin profile + password rotation and MFA enforcement screen

---

## 2) Doctor and Clinic Registration Oversight
Current status: `Partial`

Evidence in code:
- Doctor list/detail/add/update routes exist: `src/app/admin/doctors/**`
- Doctor verification actions exist (approve/reject/toggle): `src/components/doctor/doctor-details.jsx`
- Verification status filter exists: `src/app/admin/doctors/page.jsx`
- Hospitals/clinic area currently uses static local data: `src/app/admin/hospitals/page.jsx`

Checklist:
- [x] Doctor registration review list and detailed profile review
- [x] Approve/reject verification workflow with rejection reason
- [x] Doctor status activation toggle
- [ ] Build real clinic/hospital verification queue backed by API (replace static mock data)
- [ ] Add clinic document review and approval/rejection states
- [ ] Add combined queue filters (doctor pending + clinic pending + SLA aging)
- [ ] Add bulk actions (approve/reject/assign reviewer) for operations throughput

---

## 3) Appointment Operations and Patient/Provider Oversight
Current status: `Implemented` (core ops), `Partial` (SRS analytics depth)

Evidence in code:
- Appointment listing/detail/update/create: `src/app/admin/appointments/**`
- Booking status update modal: `src/components/booking/update-booking-modal.jsx`
- Patient listing/detail/update/bookings: `src/app/admin/patients/**`
- Service partners and services modules: `src/app/admin/service-partners/**`, `src/app/admin/services/**`

Checklist:
- [x] Appointment lifecycle admin operations (view/create/update/status)
- [x] Patient profile + treatment/bookings operational views
- [x] Service and provider management foundations
- [ ] Add operations dashboards for queue health (pending approvals, no-shows, cancellations)
- [ ] Add configurable SLA alerts (stale pending bookings, unassigned providers)
- [ ] Add advanced exports for appointments by status/city/service/date-window

---

## 4) Content Moderation (Social Posts and Research)
Current status: `Partial`

Evidence in code:
- Doctor social listing/details exist: `src/app/admin/doctors/[doctorId]/social/**`
- Social post components exist: `src/components/doctor/social/*`
- Current social flow appears engagement-oriented (view/follow/comment) more than moderation queue.

Checklist:
- [x] Social content visibility in admin
- [ ] Add moderation queue (`reported`, `pending review`, `resolved`)
- [ ] Add moderation actions (hide/unhide, remove, warn, suspend content author)
- [ ] Add moderation audit entries (who actioned, when, reason)
- [ ] Add research-content moderation panel (SRS requires post/research moderation)
- [ ] Add policy labels and rule-based filtering for unsafe content

---

## 5) Payment, Refund, Settlement, and Dispute Management
Current status: `Missing`

Evidence in code:
- No dedicated admin payment/dispute pages in `src/app/admin/*`
- No clear payment settlement workflows in admin routes/components

Checklist:
- [ ] Create `Payments` module route (`/admin/payments`) with transaction list/detail
- [ ] Create `Settlements` module route with request approval/rejection
- [ ] Create `Refunds/Disputes` module route with workflow states
- [ ] Add transaction timeline view (attempt -> success/failure -> refund -> settlement)
- [ ] Add reconciliation and finance exports (CSV/XLSX)
- [ ] Add role-scoped finance permissions and approval hierarchy

---

## 6) Analytics and Reporting Dashboard
Current status: `Missing` (dashboard), `Partial` (scattered exports)

Evidence in code:
- Dashboard page is currently placeholder: `src/app/admin/dashboard/page.jsx`
- Some export capabilities exist in feature modals (appointments/patients), but no central analytics dashboard

Checklist:
- [ ] Build real dashboard cards: users, doctors, appointments, revenue, disputes
- [ ] Add trend charts by day/week/month and filters by city/service
- [ ] Add funnel metrics (registration -> approval -> first booking)
- [ ] Add moderation and support KPIs
- [ ] Add finance KPIs (GMV, refunds, settlement aging)
- [ ] Add downloadable scheduled reports

---

## 7) System Administration, Audit Logs, and Operational Security
Current status: `Partial`

Evidence in code:
- Crash reporting exists: `src/app/admin/crash-report/**`, `src/hooks/useCrashReporter.js`
- Auth middleware exists, but permission enforcement is not active: `src/proxy.js`
- No dedicated admin activity log pages found

Checklist:
- [x] Crash observability surface for frontend/API errors
- [ ] Build admin activity logs module (action, actor, entity, before/after snapshot)
- [ ] Add immutable audit trail UI with filters and export
- [ ] Add suspicious activity monitoring (failed logins, unusual permission changes)
- [ ] Add settings for security policies (password policy, forced logout windows)
- [ ] Add cloud/system health dashboard hooks (uptime, alerts, dependency status)

---

## 8) Priority Delivery Plan (Suggested)
Phase 1 (must-have SRS compliance):
- [ ] Enforce RBAC in middleware and route guards
- [ ] Implement real Dashboard analytics
- [ ] Implement Payment/Refund/Settlement/Dispute modules
- [ ] Replace Hospitals static page with API-backed verification workflow
- [ ] Build moderation queue + actions for social/research content

Phase 2 (operational hardening):
- [ ] Admin activity log and audit exports
- [ ] SLA and anomaly alerts for operations queues
- [ ] Advanced reporting and scheduled exports

Phase 3 (scale and governance):
- [ ] Bulk moderation/verification actions
- [ ] Multi-step finance approvals and compliance audit workflows
- [ ] Security policy center and incident runbook integration

---

## 9) Route-Level Quick Gap Map
Present routes:
- `dashboard`, `admins`, `doctors`, `patients`, `appointments`, `services`, `service-partners`, `cities`, `categories`, `hospitals`, `crash-report`

Missing SRS-critical routes:
- [ ] `/admin/payments`
- [ ] `/admin/settlements`
- [ ] `/admin/refunds` (or `/admin/disputes`)
- [ ] `/admin/moderation` (queue-first)
- [ ] `/admin/audit-logs`
- [ ] `/admin/system-health`


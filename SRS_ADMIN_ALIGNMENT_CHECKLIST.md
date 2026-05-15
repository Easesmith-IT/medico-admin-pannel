# Medico Admin Panel - SRS Alignment Checklist

Source SRS:
- `C:\Users\kunal\Downloads\Medico app SRS.pdf`
- Normalized doc: `E:\easesmith\medico\medico_backend\MEDICO_APP_SRS.md`

Re-analysis snapshot:
- Date: `2026-05-14`
- Frontend scope: `E:\easesmith\medico\medico-admin-pannel`
- Backend integration references: `E:\easesmith\medico\medico_backend\route\adminPaymentRoute.js`, `E:\easesmith\medico\medico_backend\controller\adminPaymentController.js`, `E:\easesmith\medico\medico_backend\controller\adminGovernanceController.js`

Status legend:
- `Implemented`: operational in UI and wired to APIs.
- `Partial`: usable baseline exists, but SRS-depth workflows remain.
- `Missing`: not built or still mock/static.

---

## 1) Authentication, Access Control, and Admin Governance
Current status: `Implemented` (core), `Partial` (policy-grade enforcement depth)

Evidence in code:
- Login + cookie auth flow: `src/app/(auth)/(login)/page.jsx`
- Protected `/admin/*` with permission mapping via middleware: `src/proxy.js`, `src/constants/permissions.js`
- Admin lifecycle flows (list/create/edit/delete/toggle/detail): `src/app/admin/admins/**`, `src/components/admin/admin.jsx`, `src/components/admin/admin-form.jsx`
- Session/device governance + force logout + profile security + MFA + policy + audit pages: `src/app/admin/security/**`, `src/app/admin/profile/page.jsx`, `src/app/admin/governance/audit-logs/page.jsx`

Checklist:
- [x] Admin login UI and backend auth integration
- [x] Protected `/admin/*` routing via middleware auth check
- [x] Enforce route-level RBAC in middleware using `userInfo.permissions`
- [x] Sub-admin create/list/status toggle
- [x] Admin edit/delete workflows with permission-aware UI actions
- [x] Session/device management (self session revoke + revoke-all + force logout)
- [x] Admin profile + password rotation + MFA configuration screens
- [ ] Enforce security policy controls (for example password rotation checks) at login/session boundaries

---

## 2) Doctor and Clinic Registration Oversight
Current status: `Partial`

Evidence in code:
- Doctor review/verification/status operations: `src/app/admin/doctors/**`, `src/components/doctor/doctor-details.jsx`
- Hospital section still mock/static dataset and local filtering: `src/app/admin/hospitals/page.jsx`

Checklist:
- [x] Doctor registration review list and detailed profile review
- [x] Approve/reject verification workflow with rejection reason
- [x] Doctor status activation toggle
- [ ] Replace hospitals static page with API-backed clinic verification queue
- [ ] Add clinic document review and approval/rejection workflow
- [ ] Add combined queue filters (doctor pending + clinic pending + SLA aging)
- [ ] Add bulk verification actions (approve/reject/assign reviewer)

---

## 3) Appointment Operations and Patient/Provider Oversight
Current status: `Implemented` (workspace + lifecycle), `Partial` (ops intelligence layer)

Evidence in code:
- Appointment list/create/update/detail flows: `src/app/admin/appointments/**`
- Upgraded appointment detail workspace + recommendations UI: `src/app/admin/appointments/[appointmentId]/page.jsx`, `src/components/booking/appointment-*.jsx`
- Patient, service partner, service operational modules: `src/app/admin/patients/**`, `src/app/admin/service-partners/**`, `src/app/admin/services/**`
- Appointment export and advanced filters exist: `src/app/admin/appointments/page.jsx`

Checklist:
- [x] Appointment lifecycle admin operations (view/create/update/status)
- [x] Patient profile + treatment/bookings operational views
- [x] Service and provider management foundations
- [x] Appointment export by operational filters (status/city/service/date window)
- [ ] Add queue-health dashboards (pending approvals, no-shows, cancellations)
- [ ] Add SLA alerting (stale pending bookings, unassigned providers)

---

## 4) Content Moderation (Social Posts and Research)
Current status: `Partial`

Evidence in code:
- Doctor social visibility and post-level hide/unhide actions: `src/app/admin/doctors/[doctorId]/social/**`, `src/components/doctor/social/post-card.jsx`
- No queue-first moderation module for reported/resolved workflows.

Checklist:
- [x] Social content visibility in admin
- [x] Basic post moderation action (hide/unhide)
- [ ] Moderation queue (`reported`, `pending review`, `resolved`)
- [ ] Moderation policy actions (remove, warn, suspend author)
- [ ] Moderation audit trail linkage (actor, reason, timestamp, before/after)
- [ ] Research-content moderation panel (SRS social/research governance)
- [ ] Policy labels and unsafe-content rule filters

---

## 5) Payment, Refund, Settlement, and Dispute Management
Current status: `Implemented` (V1 full suite), `Partial` (advanced governance depth)

Evidence in code:
- Payments workspace + tabs + filters + summary + export: `src/app/admin/payments/page.jsx`
- Ledger detail fintech workspace: `src/app/admin/payments/[paymentId]/page.jsx`
- Backend admin payments namespace and workflows: `E:\easesmith\medico\medico_backend\route\adminPaymentRoute.js`, `E:\easesmith\medico\medico_backend\controller\adminPaymentController.js`

Checklist:
- [x] Payments module route (`/admin/payments`) with ledger-first list
- [x] Payment ledger detail page (`/admin/payments/[paymentId]`)
- [x] Tabs for ledgers, transactions, refunds, settlements, disputes
- [x] Manual collection + manual refund actions (role gated in UI + backend)
- [x] Settlement create/list/status workflow
- [x] Dispute create/list/status workflow
- [x] Finance summary cards and export endpoint integration
- [x] Date range filter (`fromDate`/`toDate`) and city filter in payments list
- [x] Status color badges and click-through payment ID to detail
- [ ] Multi-step finance approval hierarchy and compliance sign-off workflow

---

## 6) Analytics and Reporting Dashboard
Current status: `Missing` (central dashboard), `Partial` (module-level reporting)

Evidence in code:
- Dashboard page remains placeholder: `src/app/admin/dashboard/page.jsx`
- Module-level exports exist (appointments, patients, payments, audit logs), but no unified analytics command center.

Checklist:
- [ ] Build central dashboard KPIs: users, doctors, appointments, revenue, disputes
- [ ] Add trend charts (day/week/month) with city/service filters
- [ ] Add conversion funnel metrics (registration -> approval -> first booking)
- [ ] Add moderation + support KPIs
- [ ] Add finance KPI rollups (GMV, refunds, settlement aging)
- [ ] Add scheduled report generation/delivery

---

## 7) System Administration, Audit Logs, and Operational Security
Current status: `Implemented` (core), `Partial` (monitoring depth)

Evidence in code:
- Crash observability surfaces: `src/app/admin/crash-report/**`, `src/hooks/useCrashReporter.js`
- Audit log module with filters + export: `src/app/admin/governance/audit-logs/page.jsx`
- Security sessions and revocation UI: `src/app/admin/security/sessions/page.jsx`
- MFA + security policy controls: `src/app/admin/security/mfa/page.jsx`, `src/app/admin/profile/page.jsx`

Checklist:
- [x] Crash observability surface for frontend/API errors
- [x] Admin activity log module with list/filter/export
- [x] Security policy management UI and backend policy update APIs
- [x] Session revocation workflows (single/all/force)
- [ ] Add suspicious activity monitoring dashboards (failed login spikes, unusual permission changes)
- [ ] Add immutable before/after diff visualization for critical admin actions
- [ ] Add system health/uptime/dependency operational panel

---

## 8) Priority Delivery Plan (Updated)
Phase 1 (SRS parity blockers):
- [ ] Replace `Hospitals` static page with API-driven clinic verification and document review workflow
- [ ] Build queue-first moderation center (`/admin/moderation`) with reported/resolution lifecycle
- [ ] Ship real central dashboard with operations + finance + governance KPIs

Phase 2 (operational intelligence):
- [ ] Queue SLA/anomaly monitoring for appointments, approvals, and moderation
- [ ] Suspicious activity and security anomaly dashboards
- [ ] Add dashboard-grade trend charts and funnel metrics

Phase 3 (governance and scale):
- [ ] Bulk moderation/verification actions
- [ ] Multi-step finance approvals and compliance workflow
- [ ] System health panel with dependency/uptime alert surfacing

---

## 9) Route-Level Quick Gap Map
Present SRS-relevant admin routes:
- `dashboard`
- `admins` (+ detail/edit)
- `appointments` (+ detail workspace)
- `doctors`
- `patients`
- `services`
- `service-partners`
- `payments` (+ `payments/[paymentId]`)
- `governance/audit-logs`
- `security/sessions`
- `security/mfa`
- `profile`
- `categories`, `cities`, `hospitals`, `crash-report`

Still missing/needed for stronger SRS alignment:
- [ ] `/admin/moderation` (queue-first social/research moderation hub)
- [ ] API-backed clinic verification routes/screen flow for `/admin/hospitals`
- [ ] `/admin/system-health` (ops uptime/dependency workspace)

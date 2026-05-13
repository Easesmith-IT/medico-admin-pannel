# Admin Governance Implementation Backlog

## Scope
- Authentication hardening
- Route-level RBAC
- Admin lifecycle governance
- Session/device security controls
- Profile security (password + MFA)
- Auditability

## Status Legend
- `[x]` implemented
- `[ ]` pending
- `[~]` in progress

---

## Phase 1: Authentication + Middleware RBAC (STARTED NOW)

### Frontend (`E:\easesmith\medico\medico-admin-pannel`)

1. Auth middleware hardening
- `[x]` [src/proxy.js](E:/easesmith/medico/medico-admin-pannel/src/proxy.js)
  - Safe cookie parsing
  - Backend auth fallback via `/admin/check-auth`
  - Re-enabled permission gate using `localPermissions`
  - SuperAdmin bypass + subAdmin permission checks
  - Removed token logging and weak cookie trust-only flow

2. Permission registry alignment
- `[x]` [src/constants/permissions.js](E:/easesmith/medico/medico-admin-pannel/src/constants/permissions.js)
  - Replaced legacy non-medico keys
  - Added module-to-permission mapping for admin routes

3. Session metadata cookie handling
- `[x]` [src/lib/cookies.js](E:/easesmith/medico/medico-admin-pannel/src/lib/cookies.js)
  - Added `setSessionMetaCookies` for `userInfo` + `isAuthenticated`
  - Guarded auth cookie setter against empty token writes

4. Safe cookie reader
- `[x]` [src/lib/readCookie.js](E:/easesmith/medico/medico-admin-pannel/src/lib/readCookie.js)
  - Added parse-failure fallback instead of throwing

5. Login integration with session metadata
- `[x]` [src/app/(auth)/(login)/page.jsx](E:/easesmith/medico/medico-admin-pannel/src/app/(auth)/(login)/page.jsx)
  - Removed hardcoded default credentials
  - Persisted `userInfo`/`isAuthenticated` after successful login

6. Crash telemetry body redaction
- `[x]` [src/hooks/useApiMutation.js](E:/easesmith/medico/medico-admin-pannel/src/hooks/useApiMutation.js)
  - Added sensitive field redaction for error reporting payloads

### Backend (`E:\easesmith\medico\medico_backend`)

1. Subadmin status toggle protection
- `[x]` [route/adminRoute.js](E:/easesmith/medico/medico_backend/route/adminRoute.js)
  - Added `protect("superadmin","subadmin")` to `PATCH /admin/subadmins/:id/toggle-status`

2. Auth payload enrichment for middleware RBAC
- `[x]` [controller/adminController.js](E:/easesmith/medico/medico_backend/controller/adminController.js)
  - `adminLogin` now returns `permissions`, `status`, `isActive`, `lastName`
  - `checkAuthStatus` now returns normalized role + permissions metadata
  - Added role normalization helper for robust role checks

3. Phase 1 verification
- `[x]` Backend import/syntax checks
- `[x]` Frontend production build validation
- `[~]` Live API smoke suite (login/check-auth/guarded-route) executed after backend runtime check

---

## Phase 2: Admin Lifecycle Governance

### Frontend
- `[x]` Add Admin detail view: `src/app/admin/admins/[adminId]/page.jsx`
- `[x]` Add Admin edit page: `src/app/admin/admins/[adminId]/edit/page.jsx`
- `[x]` Add delete/deactivate actions with guard states: `src/components/admin/admin.jsx`
- `[x]` Add permission editor form: `src/components/admin/admin-form.jsx` (new)

### Backend
- `[x]` Add `GET /admin/subadmins/:id`: `controller/adminController.js`, `route/adminRoute.js`
- `[x]` Add `PATCH /admin/subadmins/:id` with protected fields constraints
- `[x]` Add `DELETE /admin/subadmins/:id` (soft delete preferred)
- `[x]` Protect invariants: no self-delete, no last-superadmin deletion/demotion

### Tests
- `[~]` API matrix tests for create/read/update/delete/toggle
- `[~]` UI visibility tests for role/permission-based action availability

---

## Phase 3: Session + Device Management

### Frontend
- `[x]` Add `Security > Sessions` page: `src/app/admin/security/sessions/page.jsx`
- `[x]` Session list + force logout actions component

### Backend
- `[x]` Add admin session model: `models/adminSessionModel.js` (new)
- `[x]` Add APIs:
  - `GET /admin/sessions/me`
  - `DELETE /admin/sessions/:sessionId`
  - `DELETE /admin/sessions/me/all`
  - `POST /admin/subadmins/:id/force-logout`
- `[x]` Token/session revocation logic integration in `middleware/auth.js`

### Tests
- `[~]` Verify revoked session cannot access protected endpoints
- `[~]` Verify force logout propagation

---

## Phase 4: Profile Security (Password Rotation + MFA)

### Frontend
- `[x]` Add profile security UI: `src/app/admin/profile/page.jsx`
- `[x]` Add MFA setup/verify UI: `src/app/admin/security/mfa/page.jsx`
- `[x]` Add enforced password rotation prompts

### Backend
- `[x]` Add APIs:
  - `PATCH /admin/profile/password`
  - `POST /admin/mfa/setup`
  - `POST /admin/mfa/verify`
  - `POST /admin/mfa/disable`
  - `PATCH /admin/security-policy`
- `[x]` Add admin MFA fields in `models/adminModel.js`

### Tests
- `[~]` MFA-required login flow coverage
- `[~]` Password change invalidates previous sessions (policy controlled)

---

## Phase 5: Governance Audit + Exports

### Frontend
- `[x]` Add audit logs page: `src/app/admin/governance/audit-logs/page.jsx`
- `[x]` Add filters/export control components

### Backend
- `[x]` Add audit model: `models/adminAuditLogModel.js`
- `[x]` Audit writer utility: `utils/adminAuditLogger.js`
- `[x]` Add APIs:
  - `GET /admin/audit-logs`
  - `GET /admin/audit-logs/export`
- `[x]` Hook audit writes into sensitive admin mutations

### Tests
- `[~]` Verify every privileged action writes audit events
- `[~]` Verify export correctness against filtered query

---

## Cross-cutting Work

1. Permission policy source of truth
- `[x]` Introduce central RBAC constants package shared across middleware and admin UI.

2. Unauthorized UX
- `[~]` Add unauthorized page + consistent redirects for denied modules.

3. Regression safety
- `[~]` Keep phase-level smoke script:
  - login
  - `/admin/check-auth`
  - `/admin/subadmins`
  - one protected module route access check

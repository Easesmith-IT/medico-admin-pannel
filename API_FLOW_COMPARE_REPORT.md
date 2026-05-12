# Admin Panel vs Medico Backend API Flow Comparison

Generated at: 2026-05-12T05:10:22.238Z

## Summary

- frontendUniqueApis: 60
- backendMountedRoutes: 186
- matched: 59
- diffs: 1
- missingInBackend: 1
- methodMismatch: 0
- unresolvedCount: 0
- backendRelevantRoutes: 165
- backendRelevantNotUsedInAdminPanel: 106

## Gaps (Frontend call missing in backend or method mismatch)

| Type | Frontend Method | Frontend Path | Frontend File(s) | Backend Note |
|---|---|---|---|---|
| MISSING_IN_BACKEND | POST | `/api/v1/admin/verify-login-otp` | src/components/verify-otp-modal.jsx | POST /api/v1/doctor/verify-login-otp / POST /api/v1/patient/verify-login-otp |

## Admin Panel API Coverage (Every frontend API call)

| Method | Frontend Path | Backend Route | Backend File | Controller | Frontend File(s) |
|---|---|---|---|---|---|
| PATCH | `/api/v1/admin/bookings/:param/status` | `/api/v1/admin/bookings/:bookingId/status` | route/adminRoute.js | controller/adminController.js#updateBookingStatus | src/components/booking/update-booking-modal.jsx |
| POST | `/api/v1/admin/bookings/create` | `/api/v1/admin/bookings/create` | route/adminRoute.js | controller/adminController.js#createBookingByAdmin | src/app/admin/appointments/add/page.jsx<br/>src/app/admin/patients/[patientId]/bookings/add/page.jsx |
| GET | `/api/v1/admin/bookings/export` | `/api/v1/admin/bookings/export` | route/adminRoute.js | controller/adminController.js#exportAppointments | src/components/booking/export-modal.jsx |
| PATCH | `/api/v1/admin/bookings/update/:param` | `/api/v1/admin/bookings/update/:bookingId` | route/adminRoute.js | controller/adminController.js#updateBookingByAdmin | src/app/admin/appointments/[appointmentId]/update/page.jsx |
| GET | `/api/v1/admin/doctors` | `/api/v1/admin/doctors` | route/adminRoute.js | controller/adminController.js#getAllDoctors | src/app/admin/doctors/page.jsx |
| GET | `/api/v1/admin/doctors/:param` | `/api/v1/admin/doctors/:id` | route/adminRoute.js | controller/adminController.js#getDoctorById | src/app/admin/doctors/[doctorId]/page.jsx |
| DELETE | `/api/v1/admin/doctors/:param` | `/api/v1/admin/doctors/:id` | route/adminRoute.js | controller/adminController.js#deleteDoctor | src/components/doctor/doctor.jsx |
| PATCH | `/api/v1/admin/doctors/:param/toggle-status` | `/api/v1/admin/doctors/:id/toggle-status` | route/adminRoute.js | controller/adminController.js#toggleDoctorStatus | src/components/doctor/doctor.jsx |
| POST | `/api/v1/admin/doctors/create` | `/api/v1/admin/doctors/create` | route/adminRoute.js | controller/adminController.js#createDoctor | src/app/admin/doctors/add/page.jsx |
| POST | `/api/v1/admin/login` | `/api/v1/admin/login` | route/adminRoute.js | controller/adminController.js#adminLogin | src/app/(auth)/(login)/page.jsx |
| POST | `/api/v1/admin/logout` | `/api/v1/admin/logout` | route/adminRoute.js | controller/adminController.js#logout | src/components/app-header.jsx |
| POST | `/api/v1/admin/patient/:param/medications` | `/api/v1/admin/patient/:patientId/medications` | route/adminRoute.js | controller/adminController.js#adminAddMedication | src/components/patient/add-medication.jsx |
| DELETE | `/api/v1/admin/patient/:param/medications` | `/api/v1/admin/patient/:patientId/medications` | route/adminRoute.js | controller/adminController.js#adminRemoveMedication | src/components/patient/medication.jsx |
| GET | `/api/v1/admin/patients` | `/api/v1/admin/patients` | route/adminRoute.js | controller/adminController.js#getAllPatients | src/app/admin/patients/page.jsx |
| GET | `/api/v1/admin/patients/:param` | `/api/v1/admin/patients/:id` | route/adminRoute.js | controller/adminController.js#getPatientById | src/app/admin/patients/[patientId]/page.jsx<br/>src/app/admin/patients/[patientId]/update/page.jsx |
| PATCH | `/api/v1/admin/patients/:param/toggle-status` | `/api/v1/admin/patients/:id/toggle-status` | route/adminRoute.js | controller/adminController.js#togglePatientStatus | src/components/patient/patient.jsx |
| GET | `/api/v1/admin/patients/export` | `/api/v1/admin/patients/export` | route/adminRoute.js | controller/adminController.js#exportPatients | src/components/patient/export-modal.jsx |
| GET | `/api/v1/admin/patients/names` | `/api/v1/admin/patients/names` | route/adminRoute.js | controller/adminController.js#getPatientNames | src/app/admin/appointments/add/page.jsx<br/>src/app/admin/appointments/page.jsx<br/>src/app/admin/appointments/[appointmentId]/update/page.jsx<br/>src/app/admin/patients/[patientId]/bookings/add/page.jsx |
| GET | `/api/v1/admin/service-providers/names` | `/api/v1/admin/service-providers/names` | route/adminRoute.js | controller/adminController.js#getServiceProviderNames | src/app/admin/appointments/add/page.jsx<br/>src/app/admin/appointments/page.jsx<br/>src/app/admin/appointments/[appointmentId]/update/page.jsx<br/>src/app/admin/patients/[patientId]/bookings/add/page.jsx |
| GET | `/api/v1/admin/services/names` | `/api/v1/admin/services/names` | route/adminRoute.js | controller/adminController.js#getServiceNames | src/app/admin/appointments/add/page.jsx<br/>src/app/admin/appointments/page.jsx<br/>src/app/admin/appointments/[appointmentId]/update/page.jsx<br/>src/app/admin/patients/[patientId]/bookings/add/page.jsx |
| POST | `/api/v1/admin/signup` | `/api/v1/admin/signup` | route/adminRoute.js | controller/adminController.js#adminSignup | src/app/admin/admins/add/page.jsx |
| GET | `/api/v1/admin/subadmins` | `/api/v1/admin/subadmins` | route/adminRoute.js | controller/adminController.js#getSubAdmins | src/app/admin/admins/page.jsx |
| PATCH | `/api/v1/admin/subadmins/:param/toggle-status` | `/api/v1/admin/subadmins/:id/toggle-status` | route/adminRoute.js | controller/adminController.js#toggleSubAdminStatus | src/components/admin/admin.jsx |
| GET | `/api/v1/booking/bookings/:param` | `/api/v1/booking/bookings/:bookingId` | route/bookingRoute.js | controller/bookingController.js#getByIdBooking | src/app/admin/appointments/[appointmentId]/page.jsx<br/>src/app/admin/appointments/[appointmentId]/update/page.jsx |
| GET | `/api/v1/booking/getAllBookings` | `/api/v1/booking/getAllBookings` | route/bookingRoute.js | controller/bookingController.js#getAllBookings | src/app/admin/appointments/page.jsx |
| POST | `/api/v1/city/admin/cities` | `/api/v1/city/admin/cities` | route/cityRoute.js | controller/cityController.js#addCity | src/app/admin/cities/add/page.jsx |
| PUT | `/api/v1/city/admin/cities/:param` | `/api/v1/city/admin/cities/:cityId` | route/cityRoute.js | controller/cityController.js#updateCity | src/app/admin/cities/[cityId]/update/page.jsx |
| DELETE | `/api/v1/city/admin/cities/:param` | `/api/v1/city/admin/cities/:cityId` | route/cityRoute.js | controller/cityController.js#deleteCity | src/components/city/city.jsx |
| PATCH | `/api/v1/city/admin/cities/toggle/:param` | `/api/v1/city/admin/cities/toggle/:cityId` | route/cityRoute.js | controller/cityController.js#toggleCityStatus | src/components/city/city.jsx |
| GET | `/api/v1/city/cities/:param` | `/api/v1/city/cities/:cityId` | route/cityRoute.js | controller/cityController.js#getCityById | src/app/admin/cities/[cityId]/update/page.jsx |
| GET | `/api/v1/city/getAllCities` | `/api/v1/city/getAllCities` | route/cityRoute.js | controller/cityController.js#getAllCities | src/app/admin/appointments/add/page.jsx<br/>src/app/admin/appointments/page.jsx<br/>src/app/admin/appointments/[appointmentId]/update/page.jsx<br/>src/app/admin/cities/page.jsx<br/>src/app/admin/patients/[patientId]/bookings/add/page.jsx<br/>src/app/admin/service-partners/page.jsx<br/>src/app/admin/services/add/page.jsx<br/>src/app/admin/services/page.jsx<br/>src/app/admin/services/[serviceId]/update/page.jsx<br/>src/components/service-partner/add-steps/add-service-partner-step6.jsx |
| GET | `/api/v1/crash-report/get` | `/api/v1/crash-report/get` | route/crashReportRoutes.js | controller/crashController.js#getCrashReports | src/app/admin/crash-report/page.jsx |
| GET | `/api/v1/crash-report/get/:param` | `/api/v1/crash-report/get/:crashId` | route/crashReportRoutes.js | controller/crashController.js#getSingleCrashReport | src/app/admin/crash-report/[crashId]/page.jsx |
| GET | `/api/v1/items/category/:param` | `/api/v1/items/category/:id` | route/itemRoute.js | controller/itemCategoryController.js#getCategoryDetails | src/app/admin/categories/[categoryId]/page.jsx<br/>src/app/admin/categories/[categoryId]/update/page.jsx |
| POST | `/api/v1/items/create` | `/api/v1/items/create` | route/itemRoute.js | controller/itemCategoryController.js#createCategory | src/app/admin/categories/add/page.jsx<br/>src/components/category/add-category-modal.jsx |
| DELETE | `/api/v1/items/delete/:param` | `/api/v1/items/delete/:id` | route/itemRoute.js | controller/itemCategoryController.js#deleteCategory | src/components/category/category.jsx |
| GET | `/api/v1/items/getAllCategories` | `/api/v1/items/getAllCategories` | route/itemRoute.js | controller/itemCategoryController.js#getAllCategories | src/app/admin/categories/page.jsx |
| PATCH | `/api/v1/items/toggle-status/:param` | `/api/v1/items/toggle-status/:id` | route/itemRoute.js | controller/itemCategoryController.js#toggleCategoryStatus | src/components/category/category.jsx |
| PUT | `/api/v1/items/update/:param` | `/api/v1/items/update/:id` | route/itemRoute.js | controller/itemCategoryController.js#updateCategory | src/app/admin/categories/[categoryId]/update/page.jsx<br/>src/components/category/add-category-modal.jsx |
| GET | `/api/v1/patient/myTreatmentHistory` | `/api/v1/patient/myTreatmentHistory` | route/patientRoute.js | controller/patientController.js#getCompletePatientTreatmentHistory | src/app/admin/patients/[patientId]/bookings/page.jsx |
| PATCH | `/api/v1/patient/updateProfile/:param` | `/api/v1/patient/updateProfile/:id` | route/patientRoute.js | controller/patientController.js#updatePatient | src/app/admin/patients/[patientId]/update/page.jsx |
| PATCH | `/api/v1/serviceProvider/:param/toggle-status` | `/api/v1/serviceProvider/:id/toggle-status` | route/serviceProvider.js | controller/providerController.js#toggleStatus | src/components/service-partner/service-partner.jsx |
| POST | `/api/v1/serviceProvider/createservice-provider` | `/api/v1/serviceProvider/createservice-provider` | route/serviceProvider.js | controller/providerController.js#createServiceProvider | src/app/admin/service-partners/add/page.jsx |
| GET | `/api/v1/serviceProvider/getAllServiceProviders` | `/api/v1/serviceProvider/getAllServiceProviders` | route/serviceProvider.js | controller/providerController.js#getAllServiceProviders | src/app/admin/service-partners/page.jsx |
| GET | `/api/v1/serviceProvider/service-provider/:param` | `/api/v1/serviceProvider/service-provider/:id` | route/serviceProvider.js | controller/providerController.js#getServiceProviderById | src/app/admin/service-partners/[servicePartnerId]/page.jsx<br/>src/app/admin/service-partners/[servicePartnerId]/update/page.jsx |
| PUT | `/api/v1/serviceProvider/service-provider/:param` | `/api/v1/serviceProvider/service-provider/:id` | route/serviceProvider.js | controller/providerController.js#updateServiceProvider | src/app/admin/service-partners/[servicePartnerId]/update/page.jsx |
| DELETE | `/api/v1/serviceProvider/service-provider/:param` | `/api/v1/serviceProvider/service-provider/:id` | route/serviceProvider.js | controller/providerController.js#deleteServiceProvider | src/components/service-partner/service-partner.jsx |
| PATCH | `/api/v1/service/:param/toggle-status` | `/api/v1/service/:id/toggle-status` | route/serviceRoute.js | controller/serviceController.js#toggleServiceStatus | src/components/service/service.jsx |
| POST | `/api/v1/service/createService` | `/api/v1/service/createService` | route/serviceRoute.js | controller/serviceController.js#createService | src/app/admin/services/add/page.jsx |
| GET | `/api/v1/service/getAllServices` | `/api/v1/service/getAllServices` | route/serviceRoute.js | controller/serviceController.js#getAllServices | src/app/admin/services/page.jsx<br/>src/components/service-partner/add-steps/add-service-partner-step3.jsx |
| GET | `/api/v1/service/getServiceById/:param` | `/api/v1/service/getServiceById/:id` | route/serviceRoute.js | controller/serviceController.js#getServiceById | src/app/admin/services/[serviceId]/page.jsx<br/>src/app/admin/services/[serviceId]/update/page.jsx |
| DELETE | `/api/v1/service/service/:param` | `/api/v1/service/service/:id` | route/serviceRoute.js | controller/serviceController.js#deleteService | src/components/service/service.jsx |
| PATCH | `/api/v1/service/services/:param` | `/api/v1/service/services/:id` | route/serviceRoute.js | controller/serviceController.js#updateService | src/app/admin/services/[serviceId]/update/page.jsx |
| POST | `/api/v1/socialPost/addComment/:param` | `/api/v1/socialPost/addComment/:id` | route/socialPostRoute.js | controller/socialmediaController.js#addComment | src/components/doctor/social/add-commentmodal.jsx |
| POST | `/api/v1/socialPost/followDoctor` | `/api/v1/socialPost/followDoctor` | route/socialPostRoute.js | controller/socialmediaController.js#toggleFollowDoctor | src/components/doctor/social/overview.jsx |
| GET | `/api/v1/socialPost/getPostByAdmin/:param` | `/api/v1/socialPost/getPostByAdmin/:id` | route/socialPostRoute.js | controller/socialmediaController.js#getPostByIdByAdmin | src/app/admin/doctors/[doctorId]/social/[postId]/page.jsx |
| GET | `/api/v1/socialPost/getPosts` | `/api/v1/socialPost/getPosts` | route/socialPostRoute.js | controller/socialmediaController.js#getPosts | src/app/admin/doctors/[doctorId]/social/page.jsx |
| DELETE | `/api/v1/socialPost/posts/:param` | `/api/v1/socialPost/posts/:id` | route/socialPostRoute.js | controller/socialmediaController.js#deletePost | src/components/doctor/social/post-card.jsx |
| PATCH | `/api/v1/socialPost/posts/:param/hide` | `/api/v1/socialPost/posts/:id/hide` | route/socialPostRoute.js | controller/socialmediaController.js#toggleHidePost | src/components/doctor/social/post-card.jsx |

## Backend Routes Not Used by Admin Panel (Relevant modules)

### route/adminRoute.js (19)

- POST `/api/v1/admin/addEquipments` -> controller/adminController.js#addEquipment
- POST `/api/v1/admin/admin/booking/approve-cancellation/:bookingId` -> controller/adminController.js#approveCancellation
- GET `/api/v1/admin/admin/city/:cityId/doctors` -> controller/adminController.js#getDoctorsByCity
- GET `/api/v1/admin/admin/doctor/:doctorId/cities` -> controller/adminController.js#getDoctorCities
- POST `/api/v1/admin/admin/doctor/add-cities` -> controller/adminController.js#addDoctorToCities
- POST `/api/v1/admin/admin/doctor/remove-cities` -> controller/adminController.js#removeDoctorFromCities
- PUT `/api/v1/admin/admin/doctor/update-cities` -> controller/adminController.js#updateDoctorCities
- POST `/api/v1/admin/check-auth` -> controller/adminController.js#checkAuthStatus
- PUT `/api/v1/admin/doctors/:id/approve` -> controller/adminController.js#approveDoctor
- PUT `/api/v1/admin/doctors/:id/reject` -> controller/adminController.js#rejectDoctor
- POST `/api/v1/admin/logout-all-devices` -> controller/adminController.js#logoutAllDevices
- GET `/api/v1/admin/me` -> controller/adminController.js#getMyProfile
- DELETE `/api/v1/admin/patients/:id` -> controller/adminController.js#deletePatient
- PUT `/api/v1/admin/patients/:id/block` -> controller/adminController.js#blockPatient
- POST `/api/v1/admin/patients/create` -> controller/adminController.js#createPatient
- GET `/api/v1/admin/reports/dashboard` -> controller/adminController.js#getDashboardStats
- GET `/api/v1/admin/reports/doctors` -> controller/adminController.js#getDoctorStats
- PUT `/api/v1/admin/updateProfile` -> controller/adminController.js#updateProfile
- POST `/api/v1/admin/verify-signup-otp` -> controller/adminController.js#verifySignupOtp

### route/bookingRoute.js (11)

- PUT `/api/v1/booking/cancel/:bookingId` -> controller/bookingController.js#cancelBooking
- POST `/api/v1/booking/completed-details/:bookingId` -> controller/bookingController.js#bookingCompletedDetails
- POST `/api/v1/booking/create` -> controller/bookingController.js#createBooking
- GET `/api/v1/booking/my-bookings` -> null
- GET `/api/v1/booking/my-bookings/:providerId` -> controller/bookingController.js#getBookingsByServiceProvider
- GET `/api/v1/booking/patient/:patientId/bookings` -> controller/bookingController.js#getBookedServicesByPatientId
- GET `/api/v1/booking/patient/:treatmentId` -> controller/bookingController.js#getTreatmentById
- POST `/api/v1/booking/providerBookings` -> controller/bookingController.js#createProviderBooking
- PUT `/api/v1/booking/reschedule/:bookingId` -> controller/bookingController.js#rescheduleBooking
- GET `/api/v1/booking/service-summary/:serviceId` -> controller/bookingController.js#getServiceSummaryByServiceId
- PUT `/api/v1/booking/update-status/:bookingId` -> controller/bookingController.js#updateServiceStatus

### route/cityRoute.js (2)

- PATCH `/api/v1/city/:cityId/toggle` -> controller/cityController.js#toggleCityStatus
- GET `/api/v1/city/find/by-location` -> controller/cityController.js#findCityByLocation

### route/crashReportRoutes.js (1)

- POST `/api/v1/crash-report/create` -> controller/crashController.js#createCrashReport

### route/doctorRoute.js (32)

- GET `/api/v1/doctor/:doctorId/service-availability` -> controller/doctorController.js#getServiceAvailability
- POST `/api/v1/doctor/availability` -> controller/doctorController.js#configureAvailability
- PUT `/api/v1/doctor/availability` -> controller/doctorController.js#updateAvailability
- DELETE `/api/v1/doctor/break-time` -> controller/doctorController.js#removeBreakTime
- POST `/api/v1/doctor/break-time` -> controller/doctorController.js#addBreakTime
- PUT `/api/v1/doctor/bulk-manage-slots` -> controller/doctorController.js#bulkManageSlots
- POST `/api/v1/doctor/check-auth` -> controller/doctorController.js#checkAuthStatus
- POST `/api/v1/doctor/clinic` -> controller/doctorController.js#addClinic
- DELETE `/api/v1/doctor/clinic/:clinicId` -> controller/doctorController.js#deleteClinic
- PUT `/api/v1/doctor/clinic/:clinicId` -> controller/doctorController.js#updateClinic
- GET `/api/v1/doctor/doctor/cities/by-name/:doctorId/:cityName` -> controller/doctorController.js#getDoctorCitiesByName
- GET `/api/v1/doctor/doctor/my-cities/:doctorId` -> controller/doctorController.js#getDoctorCities
- GET `/api/v1/doctor/doctors/city/:cityName` -> controller/doctorController.js#getDoctorsByCityName
- GET `/api/v1/doctor/getAllDoctors` -> controller/doctorController.js#getAllDoctors
- GET `/api/v1/doctor/getDoctorById/:id` -> controller/doctorController.js#getDoctorById
- GET `/api/v1/doctor/getMyProfile` -> controller/doctorController.js#getMyProfile
- POST `/api/v1/doctor/login` -> controller/doctorController.js#doctorLogin
- POST `/api/v1/doctor/logout` -> controller/doctorController.js#logout
- POST `/api/v1/doctor/logout-all-devices` -> controller/doctorController.js#logoutAllDevices
- GET `/api/v1/doctor/my-availability` -> controller/doctorController.js#getMyAvailability
- POST `/api/v1/doctor/resend-login-otp` -> controller/doctorController.js#resendLoginOtp
- POST `/api/v1/doctor/resend-signup-otp` -> controller/doctorController.js#resendSignupOtp
- PUT `/api/v1/doctor/service-availability` -> controller/doctorController.js#updateServiceAvailability
- PUT `/api/v1/doctor/service-coverage` -> controller/doctorController.js#updateServiceCoverage
- POST `/api/v1/doctor/signup` -> controller/doctorController.js#doctorSignup
- GET `/api/v1/doctor/slots/:doctorId` -> controller/doctorController.js#getAvailableSlots
- GET `/api/v1/doctor/specialization/:specialization` -> controller/doctorController.js#getDoctorsBySpecialization
- PUT `/api/v1/doctor/toggle-slot` -> controller/doctorController.js#toggleSlotAvailability
- PUT `/api/v1/doctor/updateProfile` -> controller/doctorController.js#updateProfile
- POST `/api/v1/doctor/verification-documents` -> controller/doctorController.js#uploadVerificationDocuments
- POST `/api/v1/doctor/verify-login-otp` -> controller/doctorController.js#verifyLoginOtp
- POST `/api/v1/doctor/verify-signup-otp` -> controller/doctorController.js#verifySignupOtp

### route/itemRoute.js (2)

- GET `/api/v1/items/active` -> controller/itemCategoryController.js#getActiveCategories
- GET `/api/v1/items/getItemCategoryById/:id` -> controller/itemCategoryController.js#getItemsByCategory

### route/patientRoute.js (19)

- DELETE `/api/v1/patient/allergies` -> controller/patientController.js#removeAllergy
- POST `/api/v1/patient/allergies` -> controller/patientController.js#addAllergy
- POST `/api/v1/patient/check-auth` -> controller/patientController.js#checkAuthStatus
- POST `/api/v1/patient/follow/:doctorId` -> controller/patientController.js#followDoctor
- GET `/api/v1/patient/getById/:patientId` -> controller/patientController.js#getPatientById
- POST `/api/v1/patient/login` -> controller/patientController.js#patientLogin
- POST `/api/v1/patient/logout` -> controller/patientController.js#logout
- POST `/api/v1/patient/logout-all` -> controller/patientController.js#patientLogoutAll
- POST `/api/v1/patient/medical-history` -> controller/patientController.js#updateMedicalHistory
- DELETE `/api/v1/patient/medical-history/:historyId` -> controller/patientController.js#deleteMedicalHistory
- DELETE `/api/v1/patient/medications` -> controller/patientController.js#removeMedication
- POST `/api/v1/patient/medications` -> controller/patientController.js#addMedication
- GET `/api/v1/patient/profile` -> controller/patientController.js#getMyProfile
- POST `/api/v1/patient/resend-login-otp` -> controller/patientController.js#resendLoginOtp
- POST `/api/v1/patient/resend-signup-otp` -> controller/patientController.js#resendSignupOtp
- POST `/api/v1/patient/signup` -> controller/patientController.js#patientSignup
- DELETE `/api/v1/patient/unfollow/:doctorId` -> controller/patientController.js#unfollowDoctor
- POST `/api/v1/patient/verify-login-otp` -> controller/patientController.js#verifyLoginOtp
- POST `/api/v1/patient/verify-signup-otp` -> controller/patientController.js#verifySignupOtp

### route/serviceProvider.js (4)

- POST `/api/v1/serviceProvider/login` -> controller/providerController.js#loginServiceProvider
- GET `/api/v1/serviceProvider/service-provider/appointments` -> controller/providerController.js#getServiceProviderAppointments
- GET `/api/v1/serviceProvider/service-provider/appointments/:id` -> controller/providerController.js#getSingleAppointment
- GET `/api/v1/serviceProvider/service-providers/by-service/:serviceId` -> controller/providerController.js#getProvidersByServiceId

### route/serviceRoute.js (9)

- GET `/api/v1/service/:id/price` -> controller/serviceController.js#calculateServicePrice
- POST `/api/v1/service/:id/restore` -> controller/serviceController.js#restoreService
- GET `/api/v1/service/:serviceId/slots` -> controller/serviceController.js#getAvailableSlots
- POST `/api/v1/service/admin/bulk-update` -> controller/serviceController.js#bulkUpdateServices
- GET `/api/v1/service/admin/statistics` -> controller/serviceController.js#getServiceStatistics
- GET `/api/v1/service/category/:category` -> controller/serviceController.js#getServicesByCategory
- GET `/api/v1/service/city/:cityId` -> controller/serviceController.js#getServicesByCity
- GET `/api/v1/service/nursing/:nursingType` -> controller/serviceController.js#getNursingServicesByType
- GET `/api/v1/service/search` -> controller/serviceController.js#searchServices

### route/socialPostRoute.js (7)

- POST `/api/v1/socialPost/commentPost/:id` -> controller/socialmediaController.js#addComment
- POST `/api/v1/socialPost/createPost` -> null
- GET `/api/v1/socialPost/feed` -> controller/socialmediaController.js#getSocialFeed
- GET `/api/v1/socialPost/follow-stats/me` -> controller/socialmediaController.js#getMyFollowStats
- GET `/api/v1/socialPost/getPostById/:id` -> controller/socialmediaController.js#getPostById
- POST `/api/v1/socialPost/likePost/:id/toggle` -> controller/socialmediaController.js#toggleLikePost
- GET `/api/v1/socialPost/search` -> controller/socialmediaController.js#searchSocialPosts

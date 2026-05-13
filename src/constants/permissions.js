export const permissions = [
  { label: "System Admin", value: "system_admin" },
  { label: "User Management", value: "user_management" },
  { label: "Doctor Verification", value: "doctor_verification" },
  { label: "Payment Management", value: "payment_management" },
  { label: "Content Moderation", value: "content_moderation" },
];

export const localPermissions = {
  dashboard: null,
  admins: "system_admin",
  doctors: "doctor_verification",
  payments: "payment_management",
  patients: "user_management",
  appointments: "user_management",
  services: "content_moderation",
  "service-partners": "user_management",
  categories: "content_moderation",
  cities: "content_moderation",
  "crash-report": "system_admin",
  hospitals: "content_moderation",
  security: "system_admin",
  profile: "system_admin",
  governance: "system_admin",
};

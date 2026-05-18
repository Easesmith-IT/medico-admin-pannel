export const APPOINTMENT_CATEGORY_OPTIONS = [
  { value: "consultation", label: "Consultation", icon: "Stethoscope" },
  { value: "nursing", label: "Nursing", icon: "HeartPulse" },
  { value: "equipment", label: "Equipment", icon: "ShieldPlus" },
];

export const APPOINTMENT_MODE_OPTIONS = [
  { value: "Home Service", label: "Home Service" },
  { value: "Visit Provider Location", label: "Visit Provider Location" },
];

export const TREATMENT_LINK_TYPES = [
  { value: "existing", label: "Link Existing Treatment" },
  { value: "new", label: "Create New Treatment" },
  { value: "standalone", label: "Standalone Session" },
];

export const SLOT_PERIOD_ORDER = ["Morning", "Afternoon", "Evening", "Night"];

export const SLOT_PERIOD_RANGES = {
  Morning: { start: 6, end: 12 },
  Afternoon: { start: 12, end: 17 },
  Evening: { start: 17, end: 21 },
  Night: { start: 21, end: 30 },
};

export const PAYMENT_STAGES = {
  consultation: "Advance/Final",
  nursing: "Milestone/Final",
  equipment: "Advance",
};

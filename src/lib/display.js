const clean = (value) => {
  if (value === undefined || value === null) return "";
  const text = String(value).trim();
  return text &&
    text.toLowerCase() !== "undefined" &&
    text.toLowerCase() !== "null"
    ? text
    : "";
};

const firstNonEmpty = (...values) => {
  for (const value of values) {
    const normalized = clean(value);
    if (normalized) return normalized;
  }
  return "";
};

const getPath = (obj, path) => {
  if (!obj || !path) return "";
  return path
    .split(".")
    .reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
};

const fullNameFromParts = (source) =>
  clean([source?.firstName, source?.lastName].filter(Boolean).join(" "));

export const getDisplayName = (record, options = {}) => {
  const { fallback = "-", preferOwnerName = false } = options;

  if (!record) return fallback;

  const firstLast = fullNameFromParts(record);
  const firstLastSnake = clean(
    [record.first_name, record.last_name].filter(Boolean).join(" "),
  );
  const userName = fullNameFromParts(record.user);
  const userIdName = fullNameFromParts(record.userId);
  const createdByName = fullNameFromParts(record.createdBy);
  const createdByUserIdName = fullNameFromParts(record.createdBy?.userId);
  const ownerName = clean(record.ownerName);
  const explicitName = firstNonEmpty(
    ...[
      "name",
      "fullName",
      "displayName",
      "profile.name",
      "profile.fullName",
      "personalInfo.name",
      "personalInfo.fullName",
      "basicInfo.name",
      "basicInfo.fullName",
      "user.name",
      "user.fullName",
      "userId.name",
      "userId.fullName",
      "createdBy.name",
      "createdBy.fullName",
      "createdBy.userId.name",
      "createdBy.userId.fullName",
    ].map((path) => getPath(record, path)),
  );

  const name = preferOwnerName
    ? firstNonEmpty(
        ownerName,
        explicitName,
        firstLast,
        firstLastSnake,
        userName,
        userIdName,
        createdByName,
        createdByUserIdName,
      )
    : firstNonEmpty(
        explicitName,
        firstLast,
        firstLastSnake,
        userName,
        userIdName,
        createdByName,
        createdByUserIdName,
        ownerName,
      );

  return name || fallback;
};

export const getDisplayEmail = (record, fallback = "-") => {
  if (!record) return fallback;

  const email = firstNonEmpty(
    ...[
      "contactInfo.email",
      "contact.email",
      "userId.email",
      "user.email",
      "email",
      "profile.email",
      "personalInfo.email",
      "basicInfo.email",
      "createdBy.email",
      "createdBy.userId.email",
      "e_mail",
    ].map((path) => getPath(record, path)),
  );

  return email || fallback;
};

import { readCookie } from "@/lib/readCookie";

export const normalizeRole = (role = "") =>
  String(role || "")
    .toLowerCase()
    .replace(/[_\s]/g, "");

export const hasPermission = (userInfo, permissionKey) => {
  if (!permissionKey) return true;

  const role = normalizeRole(userInfo?.role);
  if (role === "superadmin") return true;

  const permissions = userInfo?.permissions;
  if (Array.isArray(permissions)) {
    return permissions.includes(permissionKey);
  }

  if (permissions && typeof permissions === "object") {
    const value = permissions[permissionKey];
    return value === true || value === "read" || value === "write";
  }

  return false;
};

export const getCurrentAdminUser = () => {
  const userInfo = readCookie("userInfo");
  return userInfo || null;
};

export const canManageAdminMutations = (userInfo) => {
  const role = normalizeRole(userInfo?.role);
  if (role !== "superadmin" && role !== "subadmin") return false;
  return hasPermission(userInfo, "system_admin");
};

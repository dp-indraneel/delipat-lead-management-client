function readNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  adminEmail: import.meta.env.VITE_ADMIN_EMAIL || "admin@example.com",
  adminPassword: import.meta.env.VITE_ADMIN_PASSWORD || "Admin@123",
  defaultAssignedToUserId: readNumber(import.meta.env.VITE_DEFAULT_ASSIGNED_TO_USER_ID, 3),
  defaultReviewerRoleId: readNumber(import.meta.env.VITE_DEFAULT_REVIEWER_ROLE_ID, 2),
  defaultSalesRoleId: readNumber(import.meta.env.VITE_DEFAULT_SALES_ROLE_ID, 3),
};

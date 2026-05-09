import type {
  ApiEnvelope,
  ApiPaginatedEnvelope,
  AppUser,
  AssignLeadInput,
  ConvertLeadIntakeDraftInput,
  CreateLeadInput,
  CreateLeadIntakeDraftInput,
  CreateRoleInput,
  CreateUserInput,
  Lead,
  LeadAssignment,
  LeadAssignmentFilters,
  LeadFilters,
  LeadIntakeDraft,
  LeadIntakeDraftFilters,
  LeadIntakeDraftImportResult,
  LoginResult,
  ModuleWithPermissions,
  PatchLeadAssignmentInput,
  PatchLeadInput,
  Role,
  RolePermissionsByModule,
  UpdateLeadInput,
  UpdateLeadIntakeDraftInput,
  UpdateRolePermissionsInput,
} from "../types/api";
import { request, downloadFile } from "./apiClient";

export const authApi = {
  login: (email: string, password: string) =>
    request<ApiEnvelope<LoginResult>>("/api/v1/auth/login", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ email, password }),
    }),
};

export const draftApi = {
  list: (filters: LeadIntakeDraftFilters) =>
    request<ApiPaginatedEnvelope<LeadIntakeDraft>>(
      "/api/v1/lead-intake-drafts",
      { method: "GET" },
      filters
    ),
  create: (payload: CreateLeadIntakeDraftInput) =>
    request<ApiEnvelope<LeadIntakeDraft>>("/api/v1/lead-intake-drafts", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  get: (id: number) =>
    request<ApiEnvelope<LeadIntakeDraft>>(`/api/v1/lead-intake-drafts/${id}`),
  patch: (id: number, payload: UpdateLeadIntakeDraftInput) =>
    request<ApiEnvelope<LeadIntakeDraft>>(`/api/v1/lead-intake-drafts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  convert: (id: number, payload: ConvertLeadIntakeDraftInput) =>
    request<ApiEnvelope<Lead>>(`/api/v1/lead-intake-drafts/${id}/convert`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  reject: (id: number, aiSummary: string) =>
    request<ApiEnvelope<LeadIntakeDraft>>(`/api/v1/lead-intake-drafts/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ aiSummary }),
    }),
  remove: (id: number) =>
    request<ApiEnvelope<null>>(`/api/v1/lead-intake-drafts/${id}`, {
      method: "DELETE",
    }),
  importJson: (payload: CreateLeadIntakeDraftInput[]) =>
    request<ApiEnvelope<LeadIntakeDraftImportResult>>("/api/v1/lead-intake-drafts/import", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  exportCsv: (filters: LeadIntakeDraftFilters) =>
    downloadFile("/api/v1/lead-intake-drafts/export", "lead-intake-drafts.csv", {
      ...filters,
      format: "csv",
    }),
  exportJson: (filters: LeadIntakeDraftFilters) =>
    downloadFile("/api/v1/lead-intake-drafts/export", "lead-intake-drafts.json", {
      ...filters,
      format: "json",
    }),
};

export const leadApi = {
  list: (filters: LeadFilters) =>
    request<ApiPaginatedEnvelope<Lead>>("/api/v1/leads", { method: "GET" }, filters),
  create: (payload: CreateLeadInput) =>
    request<ApiEnvelope<Lead>>("/api/v1/leads", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  get: (id: number) => request<ApiEnvelope<Lead>>(`/api/v1/leads/${id}`),
  update: (id: number, payload: UpdateLeadInput) =>
    request<ApiEnvelope<Lead>>(`/api/v1/leads/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  patch: (id: number, payload: PatchLeadInput) =>
    request<ApiEnvelope<Lead>>(`/api/v1/leads/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  importJson: (payload: CreateLeadInput[]) =>
    request<ApiEnvelope<Lead[]>>("/api/v1/leads/import", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  exportCsv: () => downloadFile("/api/v1/leads/export", "leads.csv", { format: "csv" }),
  exportJson: () => downloadFile("/api/v1/leads/export", "leads.json", { format: "json" }),
  assign: (id: number, payload: AssignLeadInput) =>
    request<ApiEnvelope<LeadAssignment>>(`/api/v1/leads/${id}/assign`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  remove: (id: number) =>
    request<ApiEnvelope<null>>(`/api/v1/leads/${id}`, { method: "DELETE" }),
};

export const leadAssignmentApi = {
  list: (filters: LeadAssignmentFilters) =>
    request<ApiPaginatedEnvelope<LeadAssignment>>(
      "/api/v1/lead-assignments",
      { method: "GET" },
      filters
    ),
  get: (id: number) =>
    request<ApiEnvelope<LeadAssignment>>(`/api/v1/lead-assignments/${id}`),
  patch: (id: number, payload: PatchLeadAssignmentInput) =>
    request<ApiEnvelope<LeadAssignment>>(`/api/v1/lead-assignments/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  remove: (id: number) =>
    request<ApiEnvelope<null>>(`/api/v1/lead-assignments/${id}`, {
      method: "DELETE",
    }),
};

export const adminApi = {
  listUsers: () => request<ApiEnvelope<AppUser[]>>("/api/v1/users"),
  getUser: (id: number) => request<ApiEnvelope<AppUser>>(`/api/v1/users/${id}`),
  createUser: (payload: CreateUserInput) =>
    request<ApiEnvelope<AppUser>>("/api/v1/users", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  deleteUser: (id: number) =>
    request<ApiEnvelope<null>>(`/api/v1/users/${id}`, { method: "DELETE" }),
  listRoles: () => request<ApiEnvelope<Role[]>>("/api/v1/roles"),
  createRole: (payload: CreateRoleInput) =>
    request<ApiEnvelope<Role>>("/api/v1/roles", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  listModulesAndPermissions: () =>
    request<ApiEnvelope<ModuleWithPermissions[]>>("/api/v1/roles/modules-permissions"),
  getRolePermissions: (roleId: number) =>
    request<ApiEnvelope<RolePermissionsByModule[]>>(`/api/v1/roles/${roleId}/permissions`),
  updateRolePermissions: (roleId: number, payload: UpdateRolePermissionsInput) =>
    request<ApiEnvelope<RolePermissionsByModule[]>>(`/api/v1/roles/${roleId}/permissions`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
};

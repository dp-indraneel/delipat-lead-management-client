import { ApiError, type ApiFieldErrors } from "./apiClient";

export function getApiFieldErrors(error: unknown): ApiFieldErrors {
  return error instanceof ApiError ? error.fieldErrors : {};
}

export function getApiFormMessage(error: unknown, fallback: string) {
  if (!(error instanceof ApiError)) {
    return error instanceof Error ? error.message : fallback;
  }

  return error.formErrors.length ? error.formErrors.join(", ") : error.message || fallback;
}

export function clearFieldError(fieldErrors: ApiFieldErrors, field: string) {
  if (!fieldErrors[field]) {
    return fieldErrors;
  }

  const nextErrors = { ...fieldErrors };
  delete nextErrors[field];
  return nextErrors;
}

// lib/errors.js
// Normalized error so route handlers can return consistent JSON shapes.

export class AppError extends Error {
  constructor({ status = 500, code = 'unknown', message = 'Something went wrong' }) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
  }
}

export function authRequiredError() {
  return new AppError({
    status: 401,
    code: 'not_authenticated',
    message: 'Please connect your Google account first.',
  });
}

export function forbiddenError(message = 'Missing permission for this resource.') {
  return new AppError({
    status: 403,
    code: 'forbidden',
    message,
  });
}

export function badRequestError(message) {
  return new AppError({ status: 400, code: 'bad_request', message });
}

export function toAppError(err) {
  if (err instanceof AppError) return err;

  // googleapis errors surface a response with status + data
  const status = err?.response?.status || err?.code;
  if (status === 401 || status === 403) {
    return new AppError({
      status: 401,
      code: 'google_auth_expired',
      message: 'Your Google session expired. Please reconnect.',
    });
  }
  if (status === 404) {
    return new AppError({
      status: 404,
      code: 'not_found',
      message: 'Requested resource was not found.',
    });
  }
  if (status === 429) {
    return new AppError({
      status: 429,
      code: 'rate_limited',
      message: 'Google rate limit reached. Please wait and try again.',
    });
  }

  return new AppError({
    status: 500,
    code: 'google_api_error',
    message: 'Google API request failed.',
  });
}

export function errorResponse(err) {
  const appErr = toAppError(err);
  return {
    error: { code: appErr.code, message: appErr.message },
    status: appErr.status,
  };
}

/**
 * Motia Response Wrapper Utility
 * Ensures all API responses follow the required format:
 * { status: number, body: { success: boolean, data?: any, message?: string } }
 */

interface MotiaResponseBody {
  success: boolean
  data?: any
  message?: string
}

interface MotiaResponse {
  status: number
  body: MotiaResponseBody
}

/**
 * Wrap response in Motia format
 * @param status HTTP status code
 * @param body Response body
 * @returns Motia formatted response
 */
export function wrapResponse(status: number, body: MotiaResponseBody): MotiaResponse {
  return {
    status,
    body: {
      success: body.success,
      ...(body.data !== undefined && { data: body.data }),
      ...(body.message && { message: body.message }),
    },
  }
}

/**
 * Wrap success response
 * @param data Response data
 * @param message Optional message
 * @returns Success response
 */
export function successResponse(data?: any, message?: string): MotiaResponse {
  return wrapResponse(200, {
    success: true,
    ...(data !== undefined && { data }),
    ...(message && { message }),
  })
}

/**
 * Wrap error response
 * @param status HTTP status code
 * @param message Error message
 * @param data Optional additional data
 * @returns Error response
 */
export function errorResponse(status: number, message: string, data?: any): MotiaResponse {
  return wrapResponse(status, {
    success: false,
    message,
    ...(data && { data }),
  })
}

/**
 * Wrap created response (201)
 * @param data Response data
 * @param message Optional message
 * @returns Created response
 */
export function createdResponse(data?: any, message?: string): MotiaResponse {
  return wrapResponse(201, {
    success: true,
    ...(data !== undefined && { data }),
    ...(message && { message: message || 'Created successfully' }),
  })
}

/**
 * Common error responses
 */
export const ErrorResponses = {
  badRequest: (message: string = 'Bad request', data?: any) =>
    errorResponse(400, message, data),
  unauthorized: (message: string = 'Unauthorized') => errorResponse(401, message),
  forbidden: (message: string = 'Forbidden') => errorResponse(403, message),
  notFound: (message: string = 'Not found') => errorResponse(404, message),
  conflict: (message: string = 'Conflict') => errorResponse(409, message),
  rateLimit: (message: string = 'Too many requests') => errorResponse(429, message),
  serverError: (message: string = 'Internal server error', data?: any) =>
    errorResponse(500, message, data),
}

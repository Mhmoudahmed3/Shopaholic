/**
 * @class ApiError
 * @extends Error
 * @description Custom error class for structured API error responses.
 * Throw this anywhere in a controller/middleware and the global
 * error handler will format the JSON response automatically.
 *
 * @example
 *   throw new ApiError(404, 'Product not found');
 *   throw new ApiError(401, 'No token provided');
 */
class ApiError extends Error {
    /**
     * @param {number}  statusCode  HTTP status code (400, 401, 403, 404, 409, 500 …)
     * @param {string}  message     Human-readable description of the error
     * @param {any}     [details]   Optional extra detail (e.g. validation errors)
     */
    constructor(statusCode, message, details = null) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.details = details;
        // Capture stack trace (Node.js v8 specific)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError);
        }
    }
}

module.exports = ApiError;

/**
 * Middleware for handling Mongoose errors and setting appropriate HTTP status codes.
 *
 * @param {Object} error - The Mongoose error object.
 * @param {Object} data - Additional data (ignored in this implementation, can be omitted).
 * @param {Function} next - Callback to pass control to the next middleware or error handler.
 */
const handleMongooseError = (error, data, next) => {
    const { name, code } = error;
    if (name === "MongoServerError" && code === 11000) {
        error.status = 409; // Conflict for duplicate keys
    } else {
        error.status = 400; // Bad Request for other validation errors
    }
    next(error); // Pass the error to the next error-handling middleware
};

module.exports = handleMongooseError;

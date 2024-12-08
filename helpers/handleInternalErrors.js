/**
 * Middleware for handling internal errors.
 * It takes an error object, extracts the status and message, and responds with a JSON error message.
 *
 * @param {Object} err - The error object that was passed to next().
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const handleInternalErrors= (err, req, res, next) => {
        const { status = 500, message = 'Internal Server Error' } = err;
        res.status(status).json({ message })
}

module.exports = handleInternalErrors;
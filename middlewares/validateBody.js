const { HttpError } = require("../helpers");

/**
 * Middleware for validating the request body using a schema.
 * If validation fails, it passes an error to the next middleware.
 *
 * @param {Object} schema - The validation schema (e.g., Joi schema) used to validate the request body.
 * @returns {Function} - Middleware function that validates the body of the request.
 *
 * @example
 * const Joi = require('joi');
 * const validateBody = require('./middleware/validateBody');
 *
 * const userSchema = Joi.object({
 *     name: Joi.string().min(3).required(),
 *     email: Joi.string().email().required(),
 * });
 *
 * app.post('/users', validateBody(userSchema), (req, res) => {
 *     res.status(201).json({ message: "User created successfully" });
 * });
 */
const validateBody = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body); // Validate the request body using the schema

    if (error) {
        // If validation fails, pass the error to the next middleware
        return next(HttpError(400, error.message)); // Create a 400 error with the validation message
    }

    // If validation is successful, pass control to the next middleware
    next();
};

module.exports = validateBody;

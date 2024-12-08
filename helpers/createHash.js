require('dotenv').config();
const bcrypt = require('bcrypt');
const { SALT } = process.env;

/**
 * Hashes a plain text password using bcrypt and a salt factor.
 * The salt factor is loaded from environment variables.
 *
 * @param {string} password - The plain text password to be hashed.
 * @returns {Promise<string>} - A promise that resolves to the hashed password.
 *
 * @throws {Error} - Throws an error if bcrypt fails to hash the password.
 *
 * @example
 * const hashedPassword = await createHashPassword('mySecurePassword123');
 * console.log(hashedPassword); // Output: Hashed password string
 */
const createHash = async (password) => {
    return await bcrypt.hash(password, parseInt(SALT));
};

module.exports = createHash;

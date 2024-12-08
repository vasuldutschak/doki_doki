/**
 * @module ctrlWrapper
 */

/**
 * Wrapper function to handle asynchronous controller logic and pass errors to the next middleware.
 *
 * @param {Function} ctrl - An asynchronous controller function to be wrapped.
 * @returns {Function} A middleware function that handles errors and passes them to the next middleware.
 *
 * @example
 * const express = require('express');
 * const ctrlWrapper = require('./ctrlWrapper');
 *
 * // Example controller
 * const getUsers = async (req, res, next) => {
 *     const users = await User.find(); // Assume User is a database model
 *     res.json(users);
 * };
 *
 * // Wrapping the controller
 * router.get('/users', ctrlWrapper(getUsers));
 *
 * @example
 * // Without ctrlWrapper
 * router.get('/users', async (req, res, next) => {
 *     try {
 *         const users = await User.find();
 *         res.json(users);
 *     } catch (error) {
 *         next(error);
 *     }
 * });
 */

const ctrlWrapper = ctrl => async (req, res, next) => {
    try {
        await ctrl(req, res, next)
    } catch (error) {
        next(error)
    }
}

module.exports=ctrlWrapper
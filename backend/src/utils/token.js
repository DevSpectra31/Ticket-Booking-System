const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Generate a JWT for the given user payload.
 */
const generateToken = (payload) => {
  return jwt.sign(payload, env.jwt.secret, { expiresIn: env.jwt.expiresIn });
};

/**
 * Verify and decode a JWT.
 */
const verifyToken = (token) => {
  return jwt.verify(token, env.jwt.secret);
};

module.exports = { generateToken, verifyToken };

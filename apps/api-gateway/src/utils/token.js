const jwt = require('jsonwebtoken');
const env = require('../config/env');

const signToken = (payload, options = {}) => {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn, ...options });
};

module.exports = {
  signToken
};
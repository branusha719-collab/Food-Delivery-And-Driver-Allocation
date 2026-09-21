const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

// Hash password before storing in MongoDB
const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

// Verify login password
const comparePassword = async (password, passwordHash) => {
  return bcrypt.compare(password, passwordHash);
};

module.exports = {
  hashPassword,
  comparePassword
};
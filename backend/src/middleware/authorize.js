const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Demo mode: Bypass all authorization checks
    next();
  };
};

module.exports = authorize;
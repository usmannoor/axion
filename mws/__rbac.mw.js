/**
 * Express RBAC middleware.
 * Usage: rbac('superadmin', 'school_admin')
 */
module.exports = ({ managers }) => {
  return (...roles) => (req, res, next) => {
    if (!req.user) {
      return managers.responseDispatcher.dispatch(res, { ok: false, code: 401, message: 'Unauthorized', errors: ['unauthorized'] });
    }
    if (!roles.includes(req.user.role)) {
      return managers.responseDispatcher.dispatch(res, { ok: false, code: 403, message: 'Forbidden', errors: ['forbidden'] });
    }
    return next();
  };
};

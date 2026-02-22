/**
 * Express authentication middleware (JWT based).
 * Supports either:
 *  - Authorization: Bearer <token>
 *  - token: <token>  (legacy Axion header)
 */
module.exports = ({ managers }) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
    const legacy = req.headers.token;

    const token = bearer || legacy;
    if (!token) {
      return managers.responseDispatcher.dispatch(res, { ok: false, code: 401, message: 'Unauthorized', errors: ['token_missing'] });
    }

    const decoded = managers.token.verifyLongToken({ token });
    if (!decoded) {
      return managers.responseDispatcher.dispatch(res, { ok: false, code: 401, message: 'Unauthorized', errors: ['token_invalid'] });
    }

    // attach current user claims to request
    req.user = decoded;
    return next();
  };
};

/**
 * Express validation middleware using Axion's Pine validators loader.
 * schemaFn should be a function: async (data) => errorsOrNull
 * If validation fails, responds 400 with errors.
 */
// middleware/validate.js
module.exports = ({ managers }) => {
  return (schemaFn, pick = (req) => ({ ...(req.body || {}) })) => {
    return async (req, res, next) => {
      try {
        const data = pick(req);
        const result = await schemaFn(data);

        // Pine returns [] for valid; [errors] for invalid
        const errors = result?.errors?.length ? result.errors : [];

        if (errors.length > 0) {
          return managers.responseDispatcher.dispatch(res, {
            ok: false,
            code: 400,
            message: "Validation Error",
            errors,
            data: {},
          });
        }

        return next();
      } catch (err) {
        console.error("validate middleware error:", err);
        return managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 500,
          message: "Validation Error",
          errors: [{ message: err.message }],
          data: {},
        });
      }
    };
  };
};

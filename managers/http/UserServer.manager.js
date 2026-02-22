const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

module.exports = class UserServer {
  constructor({ config, managers }) {
    this.config = config;
    this.managers = managers;
    this.userApi = managers.userApi;

    // Create a dedicated express app instance (important for testing)
    this.app = express();
  }

  /** for injecting middlewares */
  use(args) {
    this.app.use(args);
  }

  /**
   * Configure express middleware + routes.
   * Exposed as a method so tests can build the app without listening on a port.
   */
  buildApp() {
    // Basic hardening + limits
    this.app.disable('x-powered-by');
    this.app.use(helmet());
    this.app.use(
      rateLimit({
        windowMs: 15 * 60 * 1000, // 15 min
        max: 100, // per IP
        standardHeaders: true,
        legacyHeaders: false,
      })
    );

    // CORS + parsers
    this.app.use(cors({ origin: '*' }));
    this.app.use(express.json({ limit: '1mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '1mb' }));
    this.app.use('/static', express.static('public'));

    // REST API routes for the School Management System (challenge requirement)
    if (this.managers.restApi && typeof this.managers.restApi.register === 'function') {
      this.managers.restApi.register(this.app);
    }

    // Keep Axion dynamic API handler (does not conflict with REST routes)
    this.app.all('/api/:moduleName/:fnName', this.userApi.mw);

    // Central error handler (must be last)
    this.app.use((err, req, res, next) => {
      console.error(err);
      return this.managers.responseDispatcher.dispatch(res, {
        ok: false,
        code: 500,
        message: 'Internal Server Error',
        errors: [err.message || 'unknown_error'],
      });
    });

    return this.app;
  }

  /** server configs */
  run() {
    this.buildApp();

    const server = http.createServer(this.app);
    server.listen(this.config.dotEnv.USER_PORT, () => {
      console.log(`${String(this.config.dotEnv.SERVICE_NAME).toUpperCase()} is running on port: ${this.config.dotEnv.USER_PORT}`);
    });

    return server;
  }
};

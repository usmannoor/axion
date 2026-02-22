const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const config = require('../config/index.config.js');
require('../connect/mongo')({ uri: config.dotEnv.MONGO_URI });

const ValidatorsLoader = require('../loaders/ValidatorsLoader');
const ResponseDispatcher = require('../managers/response_dispatcher/ResponseDispatcher.manager');
const TokenManager = require('../managers/token/Token.manager');

const AuthManager = require('../managers/auth/Auth.manager');
const SchoolManager = require('../managers/entities/school/School.manager');
const ClassroomManager = require('../managers/entities/classroom/Classroom.manager');
const StudentManager = require('../managers/entities/student/Student.manager');
const RestApiManager = require('../managers/rest/RestApi.manager');

module.exports = () => {
  const validatorsLoader = new ValidatorsLoader({
    models: require('../managers/_common/schema.models'),
    customValidators: require('../managers/_common/schema.validators'),
  });

  const validators = validatorsLoader.load();

  const managers = {};
  managers.responseDispatcher = new ResponseDispatcher();
  managers.token = new TokenManager({ config });
  managers.auth = new AuthManager({ managers, validators });
  managers.school = new SchoolManager({ managers, validators });
  managers.classroom = new ClassroomManager({ managers, validators });
  managers.student = new StudentManager({ managers, validators });
  managers.restApi = new RestApiManager({ managers, validators });

  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false }));
  app.use(cors({ origin: '*' }));
  app.use(express.json({ limit: '1mb' }));
  managers.restApi.register(app);

  // error handler
  app.use((err, req, res, next) => {
    console.error(err);
    return managers.responseDispatcher.dispatch(res, { ok: false, code: 500, message: 'Internal Server Error', errors: [err.message] });
  });

  return { app, managers, config };
};

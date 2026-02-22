const express = require('express');

module.exports = class RestApiManager {
  constructor({ managers, validators }) {
    this.managers = managers;
    this.validators = validators;
  }

  register(app) {
    const router = express.Router();

    const authMw = require('../../mws/__auth.mw')({ managers: this.managers });
    const rbac = require('../../mws/__rbac.mw')({ managers: this.managers });
    const validate = require('../../mws/__validate.mw')({ managers: this.managers });

    // Health check
    router.get('/health', (req, res) =>
      this.managers.responseDispatcher.dispatch(res, { ok: true, code: 200, data: { status: 'ok' } })
    );

    // AUTH
    router.post(
      '/auth/bootstrap-superadmin',
      validate(this.validators.auth.bootstrapSuperadmin),
      async (req, res) => {
        const result = await this.managers.auth.bootstrapSuperadmin({ body: req.body });
        return this.managers.responseDispatcher.dispatch(res, result);
      }
    );

    router.post('/auth/login', validate(this.validators.auth.login), async (req, res) => {
      const result = await this.managers.auth.login({ body: req.body });
      return this.managers.responseDispatcher.dispatch(res, result);
    });

    router.post(
      '/auth/school-admins',
      authMw,
      rbac('superadmin'),
      validate(this.validators.auth.createSchoolAdmin),
      async (req, res) => {
        const result = await this.managers.auth.createSchoolAdmin({ body: req.body });
        return this.managers.responseDispatcher.dispatch(res, result);
      }
    );

    // SCHOOLS (superadmin only)
    router.post(
      '/schools',
      authMw,
      rbac('superadmin'),
      validate(this.validators.school.create),
      async (req, res) => {
        const result = await this.managers.school.create({ body: req.body, user: req.user });
        return this.managers.responseDispatcher.dispatch(res, result);
      }
    );

    router.get('/schools', authMw, rbac('superadmin'), async (req, res) => {
      const result = await this.managers.school.list();
      return this.managers.responseDispatcher.dispatch(res, result);
    });

    router.get('/schools/:id', authMw, rbac('superadmin'), async (req, res) => {
      const result = await this.managers.school.get({ id: req.params.id });
      return this.managers.responseDispatcher.dispatch(res, result);
    });

    router.put(
      '/schools/:id',
      authMw,
      rbac('superadmin'),
      validate(this.validators.school.update, (req) => ({ ...req.body, id: req.params.id })),
      async (req, res) => {
        const result = await this.managers.school.update({ id: req.params.id, body: req.body });
        return this.managers.responseDispatcher.dispatch(res, result);
      }
    );

    router.delete('/schools/:id', authMw, rbac('superadmin'), async (req, res) => {
      const result = await this.managers.school.remove({ id: req.params.id });
      return this.managers.responseDispatcher.dispatch(res, result);
    });

    // CLASSROOMS (school_admin scoped, superadmin optional)
    router.post(
      '/classrooms',
      authMw,
      rbac('school_admin', 'superadmin'),
      validate(this.validators.classroom.create),
      async (req, res) => {
        const result = await this.managers.classroom.create({ body: req.body, user: req.user });
        return this.managers.responseDispatcher.dispatch(res, result);
      }
    );

    router.get('/classrooms', authMw, rbac('school_admin', 'superadmin'), async (req, res) => {
      const result = await this.managers.classroom.list({ user: req.user, query: req.query });
      return this.managers.responseDispatcher.dispatch(res, result);
    });

    router.put(
      '/classrooms/:id',
      authMw,
      rbac('school_admin', 'superadmin'),
      validate(this.validators.classroom.update, (req) => ({ ...req.body, id: req.params.id })),
      async (req, res) => {
        const result = await this.managers.classroom.update({ id: req.params.id, body: req.body, user: req.user });
        return this.managers.responseDispatcher.dispatch(res, result);
      }
    );

    router.delete('/classrooms/:id', authMw, rbac('school_admin', 'superadmin'), async (req, res) => {
      const result = await this.managers.classroom.remove({ id: req.params.id, user: req.user });
      return this.managers.responseDispatcher.dispatch(res, result);
    });

    // STUDENTS
    router.post(
      '/students',
      authMw,
      rbac('school_admin', 'superadmin'),
      validate(this.validators.student.create),
      async (req, res) => {
        const result = await this.managers.student.create({ body: req.body, user: req.user });
        return this.managers.responseDispatcher.dispatch(res, result);
      }
    );

    router.get('/students', authMw, rbac('school_admin', 'superadmin'), async (req, res) => {
      const result = await this.managers.student.list({ user: req.user, query: req.query });
      return this.managers.responseDispatcher.dispatch(res, result);
    });

    router.put(
      '/students/:id',
      authMw,
      rbac('school_admin', 'superadmin'),
      validate(this.validators.student.update, (req) => ({ ...req.body, id: req.params.id })),
      async (req, res) => {
        const result = await this.managers.student.update({ id: req.params.id, body: req.body, user: req.user });
        return this.managers.responseDispatcher.dispatch(res, result);
      }
    );

    router.delete('/students/:id', authMw, rbac('school_admin', 'superadmin'), async (req, res) => {
      const result = await this.managers.student.remove({ id: req.params.id, user: req.user });
      return this.managers.responseDispatcher.dispatch(res, result);
    });

    router.put(
      '/students/:id/transfer',
      authMw,
      rbac('school_admin', 'superadmin'),
      validate(this.validators.student.transfer, (req) => ({ ...req.body, id: req.params.id })),
      async (req, res) => {
        const result = await this.managers.student.transfer({ id: req.params.id, body: req.body, user: req.user });
        return this.managers.responseDispatcher.dispatch(res, result);
      }
    );

    // Mount under /api
    app.use('/api', router);
  }
};

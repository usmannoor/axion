const Classroom = require('./Classroom.model');
const School = require('../school/School.model');

module.exports = class ClassroomManager {
  constructor({ managers, validators }) {
    this.managers = managers;
    this.validators = validators;
  }

  async create({ body, user }) {
    const validation = await this.validators.classroom.create(body);
    if (validation?.length) return { ok: false, code: 400, errors: validation, message: 'Validation Error' };

    // school_admin can only create inside their own school
    const schoolId = user.role === 'school_admin' ? user.school : body.schoolId;
    if (!schoolId) return { ok: false, code: 400, message: 'schoolId is required', errors: ['school_required'] };

    const schoolExists = await School.findById(schoolId);
    if (!schoolExists) return { ok: false, code: 404, message: 'School not found', errors: ['school_not_found'] };

    const created = await Classroom.create({
      name: body.name,
      school: schoolId,
      capacity: body.capacity,
      resources: body.resources || [],
    });

    return { ok: true, code: 201, data: created };
  }

  async list({ user, query }) {
    const q = {};
    if (user.role === 'school_admin') q.school = user.school;
    if (user.role === 'superadmin' && query.schoolId) q.school = query.schoolId;

    const classrooms = await Classroom.find(q).sort({ createdAt: -1 });
    return { ok: true, code: 200, data: classrooms };
  }

  async update({ id, body, user }) {
    const validation = await this.validators.classroom.update({ ...body, id });
    if (validation?.length) return { ok: false, code: 400, errors: validation, message: 'Validation Error' };

    const existing = await Classroom.findById(id);
    if (!existing) return { ok: false, code: 404, message: 'Classroom not found', errors: ['classroom_not_found'] };

    if (user.role === 'school_admin' && String(existing.school) !== String(user.school)) {
      return { ok: false, code: 403, message: 'Forbidden', errors: ['forbidden'] };
    }

    existing.name = body.name ?? existing.name;
    existing.capacity = body.capacity ?? existing.capacity;
    existing.resources = body.resources ?? existing.resources;

    await existing.save();
    return { ok: true, code: 200, data: existing };
  }

  async remove({ id, user }) {
    const existing = await Classroom.findById(id);
    if (!existing) return { ok: false, code: 404, message: 'Classroom not found', errors: ['classroom_not_found'] };

    if (user.role === 'school_admin' && String(existing.school) !== String(user.school)) {
      return { ok: false, code: 403, message: 'Forbidden', errors: ['forbidden'] };
    }

    await Classroom.deleteOne({ _id: id });
    return { ok: true, code: 200, data: { deleted: true } };
  }
};

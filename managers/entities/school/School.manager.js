const School = require('./School.model');

module.exports = class SchoolManager {
  constructor({ managers, validators }) {
    this.managers = managers;
    this.validators = validators;
  }

  async create({ body, user }) {
    const validation = await this.validators.school.create(body);
    if (validation?.length) return { ok: false, code: 400, errors: validation, message: 'Validation Error' };

    const created = await School.create({
      name: body.name,
      address: body.address,
      contactEmail: body.contactEmail,
      phone: body.phone,
      createdBy: user.userId,
    });

    return { ok: true, code: 201, data: created };
  }

  async list() {
    const schools = await School.find().sort({ createdAt: -1 });
    return { ok: true, code: 200, data: schools };
  }

  async get({ id }) {
    const school = await School.findById(id);
    if (!school) return { ok: false, code: 404, message: 'School not found', errors: ['school_not_found'] };
    return { ok: true, code: 200, data: school };
  }

  async update({ id, body }) {
    const validation = await this.validators.school.update({ ...body, id });
    if (validation?.length) return { ok: false, code: 400, errors: validation, message: 'Validation Error' };

    const school = await School.findByIdAndUpdate(
      id,
      { $set: { ...body } },
      { new: true, runValidators: true }
    );
    if (!school) return { ok: false, code: 404, message: 'School not found', errors: ['school_not_found'] };

    return { ok: true, code: 200, data: school };
  }

  async remove({ id }) {
    const school = await School.findByIdAndDelete(id);
    if (!school) return { ok: false, code: 404, message: 'School not found', errors: ['school_not_found'] };
    return { ok: true, code: 200, data: { deleted: true } };
  }
};

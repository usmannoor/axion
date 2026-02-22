const bcrypt = require('bcrypt');
const { nanoid } = require('nanoid');

const User = require('../entities/user/User.model');
const School = require('../entities/school/School.model');

module.exports = class AuthManager {
  constructor({ managers, validators }) {
    this.managers = managers;
    this.validators = validators;

    // Not using Axion dynamic APIs for the challenge, but keeping it compatible
    this.httpExposed = [];
  }

  async bootstrapSuperadmin({ body }) {
    const validation = await this.validators.auth.bootstrapSuperadmin(body);
    if (validation?.errors?.length) return { ok: false, code: 400, errors: validation, message: 'Validation Error' };

    const existing = await User.findOne({ role: 'superadmin' });
    if (existing) {
      return { ok: false, code: 409, message: 'Superadmin already exists', errors: ['superadmin_exists'] };
    }

    const passwordHash = await bcrypt.hash(body.password, 10);
    const userKey = nanoid();

    const user = await User.create({
      name: body.name,
      email: body.email,
      passwordHash,
      role: 'superadmin',
      school: null,
      userKey,
    });

    const longToken = this.managers.token.genLongToken({
      userId: user._id.toString(),
      userKey,
      role: user.role,
      school: user.school,
    });

    return {
      ok: true,
      code: 201,
      data: {
        user: { id: user._id, name: user.name, email: user.email, role: user.role, school: user.school },
        longToken,
      },
    };
  }

  async login({ body }) {
    const validation = await this.validators.auth.login(body);
    if (validation?.errors?.length) return { ok: false, code: 400, errors: validation, message: 'Validation Error' };

    const user = await User.findOne({ email: body.email });
    if (!user) return { ok: false, code: 401, message: 'Invalid credentials', errors: ['invalid_credentials'] };

    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) return { ok: false, code: 401, message: 'Invalid credentials', errors: ['invalid_credentials'] };

    const userKey = user.userKey || nanoid();
    if (!user.userKey) {
      user.userKey = userKey;
      await user.save();
    }

    const longToken = this.managers.token.genLongToken({
      userId: user._id.toString(),
      userKey,
      role: user.role,
      school: user.school,
    });

    return {
      ok: true,
      code: 200,
      data: {
        user: { id: user._id, name: user.name, email: user.email, role: user.role, school: user.school },
        longToken,
      },
    };
  }

  async createSchoolAdmin({ body }) {
    const validation = await this.validators.auth.createSchoolAdmin(body);
    if (validation?.errors?.length) return { ok: false, code: 400, errors: validation, message: 'Validation Error' };

    const school = await School.findById(body.schoolId);
    if (!school) return { ok: false, code: 404, message: 'School not found', errors: ['school_not_found'] };

    const exists = await User.findOne({ email: body.email });
    if (exists) return { ok: false, code: 409, message: 'Email already exists', errors: ['email_exists'] };

    const passwordHash = await bcrypt.hash(body.password, 10);
    const userKey = nanoid();

    const user = await User.create({
      name: body.name,
      email: body.email,
      passwordHash,
      role: 'school_admin',
      school: school._id,
      userKey,
    });

    return {
      ok: true,
      code: 201,
      data: { id: user._id, name: user.name, email: user.email, role: user.role, school: user.school },
    };
  }
};

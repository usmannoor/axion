const Student = require('./Student.model');
const Classroom = require('../classroom/Classroom.model');
const School = require('../school/School.model');

module.exports = class StudentManager {
  constructor({ managers, validators }) {
    this.managers = managers;
    this.validators = validators;
  }

  async create({ body, user }) {
    const validation = await this.validators.student.create(body);
    if (validation?.length) return { ok: false, code: 400, errors: validation, message: 'Validation Error' };

    const schoolId = user.role === 'school_admin' ? user.school : body.schoolId;
    if (!schoolId) return { ok: false, code: 400, message: 'schoolId is required', errors: ['school_required'] };

    const schoolExists = await School.findById(schoolId);
    if (!schoolExists) return { ok: false, code: 404, message: 'School not found', errors: ['school_not_found'] };

    let classroom = null;
    if (body.classroomId) {
      classroom = await Classroom.findById(body.classroomId);
      if (!classroom) return { ok: false, code: 404, message: 'Classroom not found', errors: ['classroom_not_found'] };
      if (String(classroom.school) !== String(schoolId)) {
        return { ok: false, code: 400, message: 'Classroom does not belong to school', errors: ['classroom_school_mismatch'] };
      }
    }

    const created = await Student.create({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      school: schoolId,
      classroom: classroom ? classroom._id : null,
    });

    return { ok: true, code: 201, data: created };
  }

  async list({ user, query }) {
    const q = {};
    if (user.role === 'school_admin') q.school = user.school;
    if (user.role === 'superadmin' && query.schoolId) q.school = query.schoolId;
    const students = await Student.find(q).sort({ createdAt: -1 });
    return { ok: true, code: 200, data: students };
  }

  async update({ id, body, user }) {
    const validation = await this.validators.student.update({ ...body, id });
    if (validation?.length) return { ok: false, code: 400, errors: validation, message: 'Validation Error' };

    const student = await Student.findById(id);
    if (!student) return { ok: false, code: 404, message: 'Student not found', errors: ['student_not_found'] };

    if (user.role === 'school_admin' && String(student.school) !== String(user.school)) {
      return { ok: false, code: 403, message: 'Forbidden', errors: ['forbidden'] };
    }

    // Optional classroom reassignment within same school
    if (body.classroomId) {
      const classroom = await Classroom.findById(body.classroomId);
      if (!classroom) return { ok: false, code: 404, message: 'Classroom not found', errors: ['classroom_not_found'] };
      if (String(classroom.school) !== String(student.school)) {
        return { ok: false, code: 400, message: 'Classroom does not belong to student school', errors: ['classroom_school_mismatch'] };
      }
      student.classroom = classroom._id;
    }

    student.firstName = body.firstName ?? student.firstName;
    student.lastName = body.lastName ?? student.lastName;
    student.email = body.email ?? student.email;

    await student.save();
    return { ok: true, code: 200, data: student };
  }

  async remove({ id, user }) {
    const student = await Student.findById(id);
    if (!student) return { ok: false, code: 404, message: 'Student not found', errors: ['student_not_found'] };

    if (user.role === 'school_admin' && String(student.school) !== String(user.school)) {
      return { ok: false, code: 403, message: 'Forbidden', errors: ['forbidden'] };
    }

    await Student.deleteOne({ _id: id });
    return { ok: true, code: 200, data: { deleted: true } };
  }

  /**
   * Transfer capability:
   * - school_admin: can transfer only within their assigned school (e.g., classroom change)
   * - superadmin: can transfer between schools as well
   */
  async transfer({ id, body, user }) {
    const validation = await this.validators.student.transfer({ ...body, id });
    if (validation?.length) return { ok: false, code: 400, errors: validation, message: 'Validation Error' };

    const student = await Student.findById(id);
    if (!student) return { ok: false, code: 404, message: 'Student not found', errors: ['student_not_found'] };

    if (user.role === 'school_admin') {
      // Must be within their school
      if (String(student.school) !== String(user.school)) {
        return { ok: false, code: 403, message: 'Forbidden', errors: ['forbidden'] };
      }
      if (String(body.targetSchoolId) !== String(user.school)) {
        return { ok: false, code: 403, message: 'School admins cannot transfer across schools', errors: ['cross_school_transfer_forbidden'] };
      }
    }

    const targetSchool = await School.findById(body.targetSchoolId);
    if (!targetSchool) return { ok: false, code: 404, message: 'Target school not found', errors: ['school_not_found'] };

    let targetClassroomId = null;
    if (body.targetClassroomId) {
      const targetClassroom = await Classroom.findById(body.targetClassroomId);
      if (!targetClassroom) return { ok: false, code: 404, message: 'Target classroom not found', errors: ['classroom_not_found'] };
      if (String(targetClassroom.school) !== String(body.targetSchoolId)) {
        return { ok: false, code: 400, message: 'Target classroom does not belong to target school', errors: ['classroom_school_mismatch'] };
      }
      targetClassroomId = targetClassroom._id;
    }

    student.school = body.targetSchoolId;
    student.classroom = targetClassroomId;

    await student.save();
    return { ok: true, code: 200, data: student };
  }
};

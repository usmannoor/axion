module.exports = {
  bootstrapSuperadmin: [
    { model: 'name', required: true },
    { model: 'email', required: true },
    { model: 'password', required: true },
  ],
  login: [
    { model: 'email', required: true },
    { model: 'password', required: true },
  ],
  createSchoolAdmin: [
    { model: 'name', required: true },
    { model: 'email', required: true },
    { model: 'password', required: true },
    { model: 'objectId', path: 'schoolId', required: true },
  ],
};

module.exports = {
  create: [
    { model: 'name', path: 'firstName', required: true },
    { model: 'name', path: 'lastName', required: true },
    { model: 'email', required: true },
    { model: 'objectId', path: 'classroomId', required: false },
  ],
  update: [
    { model: 'objectId', path: 'id', required: true },
    { model: 'name', path: 'firstName', required: false },
    { model: 'name', path: 'lastName', required: false },
    { model: 'email', required: false },
    { model: 'objectId', path: 'classroomId', required: false },
  ],
  transfer: [
    { model: 'objectId', path: 'id', required: true },
    { model: 'objectId', path: 'targetSchoolId', required: true },
    { model: 'objectId', path: 'targetClassroomId', required: false },
  ],
};

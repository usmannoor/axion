module.exports = {
  create: [
    { model: 'name', required: true },
    { model: 'address', required: true },
    { model: 'email', path: 'contactEmail', required: true },
    { model: 'phone', required: false },
  ],
  update: [
    { model: 'objectId', path: 'id', required: true },
    { model: 'name', required: false },
    { model: 'address', required: false },
    { model: 'email', path: 'contactEmail', required: false },
    { model: 'phone', required: false },
  ],
};

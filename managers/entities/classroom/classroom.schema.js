module.exports = {
  create: [
    { model: 'name', required: true },
    { model: 'capacity', required: true },
    { model: 'arrayOfStrings', path: 'resources', required: false },
  ],
  update: [
    { model: 'objectId', path: 'id', required: true },
    { model: 'name', required: false },
    { model: 'capacity', required: false },
    { model: 'arrayOfStrings', path: 'resources', required: false },
  ],
};

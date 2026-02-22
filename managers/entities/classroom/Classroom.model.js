const mongoose = require('mongoose');
const { Schema } = mongoose;

const ClassroomSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    school: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    capacity: { type: Number, required: true, min: 1 },
    resources: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

module.exports = mongoose.models.Classroom || mongoose.model('Classroom', ClassroomSchema);

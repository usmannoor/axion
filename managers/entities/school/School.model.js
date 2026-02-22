const mongoose = require('mongoose');
const { Schema } = mongoose;

const SchoolSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    contactEmail: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.School || mongoose.model('School', SchoolSchema);

const mongoose = require('mongoose');
const { Schema } = mongoose;

const StudentSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },

    school: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    classroom: { type: Schema.Types.ObjectId, ref: 'Classroom', default: null },

    enrollmentDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Optional: unique per school (helps data quality)
StudentSchema.index({ school: 1, email: 1 }, { unique: true });

module.exports = mongoose.models.Student || mongoose.model('Student', StudentSchema);

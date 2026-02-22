const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true, index: true },
    passwordHash: { type: String, required: true },

    // used by Axion token manager
    userKey: { type: String, required: true },

    role: { type: String, enum: ['superadmin', 'school_admin'], required: true },
    school: { type: Schema.Types.ObjectId, ref: 'School', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);

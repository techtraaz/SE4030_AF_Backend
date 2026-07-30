import mongoose from 'mongoose';

const languageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Language name is required'],
    unique: true,
    trim: true,
  },
  code: {
    type: String,
    required: [true, 'Language code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    minlength: 2,
    maxlength: 5, // For codes like 'en-US'
  },
  nativeName: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster queries
languageSchema.index({ isActive: 1, code: 1 });

export default mongoose.model('Language', languageSchema);

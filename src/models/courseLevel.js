import mongoose from 'mongoose';

const courseLevelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Level name is required'],
    unique: true,
    trim: true,
  },
  displayOrder: {
    type: Number,
    required: true,
    default: 0,
  },
  description: {
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
courseLevelSchema.index({ isActive: 1, displayOrder: 1 });

export default mongoose.model('CourseLevel', courseLevelSchema);

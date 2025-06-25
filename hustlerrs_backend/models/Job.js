const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required.'],
    trim: true,
  },
  description: {
    type: String,
  },
  jobType: {
    type: String,
    required: [true, 'Job type is required.'],
    enum: ['Physical Job', 'Cleaning', 'Shop Helper', 'Online Work', 'Delivery Help', 'Event Setup', 'Tutoring', 'Packaging', 'Other'],
  },
  location: {
    area: {
      type: String,
      required: [true, 'Area is required.'],
    },
    address: {
      type: String,
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },
  },
  date: {
    type: Date,
    required: [true, 'Date is required.'],
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required.'],
  },
  duration: {
    type: String,
    required: [true, 'Duration is required.'],
  },
  payment: {
    method: {
      type: String,
      required: [true, 'Payment method is required.'],
      enum: ['Fixed price', 'Hourly'],
    },
    amount: {
      type: Number,
      // Required if method is 'Fixed price'
    },
    rate: {
        type: Number,
        // Required if method is 'Hourly'
    },
    platform: {
      type: String,
      required: [true, 'Payment platform is required.'],
      enum: ['Cash', 'bKash', 'Nagad'],
    },
  },
  hiringType: {
    type: String,
    required: [true, 'Hiring type is required.'],
    enum: ['Allow Bidding', 'Instant Hire'],
  },
  skillRequirements: {
    type: [String],
    default: ['No skill needed'],
  },
  workerPreference: {
    gender: {
      type: String,
      enum: ['Any', 'Only male', 'Only female'],
      default: 'Any',
    },
    ageRange: {
      type: String,
      default: 'Any',
    },
    studentOnly: {
      type: Boolean,
      default: true,
    },
    experience: {
      type: String,
      default: 'None',
    },
  },
  photos: {
    type: [String],
  },
  contactInfo: {
    phone: {
      type: String,
      required: [true, 'Contact phone number is required.'],
    },
    email: {
      type: String,
    },
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'completed', 'cancelled'],
    default: 'open',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  bids: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bid',
    }
  ],
  isReviewed: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for applicant count
jobSchema.virtual('applicantCount', {
  ref: 'Bid',
  localField: '_id',
  foreignField: 'job',
  count: true
});

// Add 2dsphere index for location.coordinates
jobSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Job', jobSchema);

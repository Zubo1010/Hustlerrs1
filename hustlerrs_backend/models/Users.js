const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        required: true,
        trim: true,
    },
    jobGiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true,
    }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['Hustler', 'Job Giver', 'Admin'],
    default: 'Hustler',
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // Allow multiple null values
    lowercase: true,
  },
  phone: {
    type: String,
    unique: true,
    sparse: true, // Allow multiple null values
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [lng, lat]
      default: undefined,
    },
  },
  division: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  upazila: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
  },
  // Fields specific to Hustlers
  age: {
    type: Number,
    min: 16,
    max: 100,
  },
  skills: [{
    type: String,
    trim: true,
  }],
  badges: [{
    type: String,
    trim: true,
  }],
  // Fields specific to Job Givers
  businessName: {
    type: String,
    default: '',
  },
  // Common fields
  isProfileComplete: {
    type: Boolean,
    default: false,
  },
  reviews: [reviewSchema], // Embed reviews for Hustlers
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for completed jobs count (for Hustlers)
userSchema.virtual('completedJobsCount', {
  ref: 'Job',
  localField: '_id',
  foreignField: 'chosenHustler',
  count: true,
  match: { status: 'completed' }
});

// Virtual for posted jobs count (for Job Givers)
userSchema.virtual('postedJobsCount', {
  ref: 'Job',
  localField: '_id',
  foreignField: 'createdBy',
  count: true
});

// Virtual for average rating for a Hustler
userSchema.virtual('averageRating').get(function() {
    if (this.role === 'Hustler' && this.reviews && this.reviews.length > 0) {
        const total = this.reviews.reduce((acc, review) => acc + review.rating, 0);
        // Return average rounded to one decimal place
        return (total / this.reviews.length).toFixed(1);
    }
    return null; // Return null if no reviews or not a Hustler
});

// Virtual for counting reviews
userSchema.virtual('reviewCount').get(function() {
    if (this.role === 'Hustler' && this.reviews) {
        return this.reviews.length;
    }
    return 0;
});

// Add 2dsphere index for coordinates
userSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('User', userSchema);

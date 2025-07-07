const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  jobType: {
    type: String,
    required: [true, 'Job type is required']
  },
  locationDivision: {
    type: String,
    required: [true, 'Division is required']
  },
  locationDistrict: {
    type: String,
    required: [true, 'District is required']
  },
  locationUpazila: {
    type: String,
    required: [true, 'Upazila is required']
  },
  locationArea: {
    type: String,
    required: [true, 'Area is required']
  },
  locationAddress: {
    type: String,
    required: [true, 'Address is required']
  },
  date: {
    type: Date,
    required: [true, 'Job date is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required']
  },
  duration: {
    type: String,
    required: [true, 'Duration is required']
  },
  payment: {
    method: {
      type: String,
      enum: ['Fixed price', 'Hourly'],
      required: [true, 'Payment method is required']
    },
    amount: {
      type: Number,
      required: function() {
        return this.payment.method === 'Fixed price';
      }
    },
    rate: {
      type: Number,
      required: function() {
        return this.payment.method === 'Hourly';
      }
    },
    platform: {
      type: String,
      required: [true, 'Payment platform is required']
    }
  },
  hiringType: {
    type: String,
    required: [true, 'Hiring type is required']
  },
  skillRequirements: {
    type: [String],
    default: ['No skill needed']
  },
  workerPreference: {
    gender: {
      type: String,
      enum: ['Any', 'Male', 'Female'],
      default: 'Any'
    },
    ageRange: {
      type: String,
      default: 'Any'
    },
    studentOnly: {
      type: Boolean,
      default: true
    },
    experience: {
      type: String,
      default: 'None'
    }
  },
  photos: {
    type: [String],
    default: []
  },
  contactInfo: {
    phone: {
      type: String,
      required: [true, 'Contact phone is required']
    },
    email: {
      type: String,
      default: ''
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'completed', 'cancelled'],
    default: 'open'
  },
  bids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamps before saving
jobSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Job', jobSchema);

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  type: {
    type: String,
    enum: ['job_application', 'bid_placed', 'bid_accepted', 'bid_rejected'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  price: {
    type: Number,
    required: function() {
      return ['bid_placed', 'bid_accepted'].includes(this.type);
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema); 
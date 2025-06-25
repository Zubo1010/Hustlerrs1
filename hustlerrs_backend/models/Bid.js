const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },

  hustler: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },

  notes: {
    type: String,
    default: '',
  },

  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending',
  },

  withdrawnAt: {
    type: Date,
    default: null,
  },

  canWithdraw: {
    type: Boolean,
    default: true,
  },

  lastStatusChange: {
    type: Date,
    default: Date.now,
  },

  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reason: String,
  }],

}, {
  timestamps: true,
});

// Add method to check if bid can be withdrawn
bidSchema.methods.canBeWithdrawn = function() {
  // Can be withdrawn if status is pending and within 24 hours of creation
  const hoursSinceCreation = (Date.now() - this.createdAt) / (1000 * 60 * 60);
  return this.status === 'pending' && hoursSinceCreation <= 24;
};

// Add method to withdraw bid
bidSchema.methods.withdraw = async function() {
  if (!this.canBeWithdrawn()) {
    throw new Error('Bid cannot be withdrawn');
  }
  
  this.status = 'withdrawn';
  this.withdrawnAt = Date.now();
  this.canWithdraw = false;
  
  this.statusHistory.push({
    status: 'withdrawn',
    changedAt: Date.now(),
    changedBy: this.hustler,
    reason: 'Withdrawn by hustler'
  });
  
  return this.save();
};

// Add method to update status
bidSchema.methods.updateStatus = async function(newStatus, changedBy, reason = '') {
  this.status = newStatus;
  this.lastStatusChange = Date.now();
  
  this.statusHistory.push({
    status: newStatus,
    changedAt: Date.now(),
    changedBy,
    reason
  });
  
  if (newStatus !== 'pending') {
    this.canWithdraw = false;
  }
  
  return this.save();
};

module.exports = mongoose.model('Bid', bidSchema);

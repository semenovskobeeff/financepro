const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  targetAmount: {
    type: Number,
    required: true,
    min: 0
  },
  deadline: {
    type: Date,
    required: true
  },
  progress: {
    type: Number,
    default: 0,
    min: 0
  },
  transferHistory: [{
    amount: Number,
    date: {
      type: Date,
      default: Date.now
    },
    fromAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account'
    }
  }],
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'archived'],
    default: 'active'
  }
}, { timestamps: true });

// Индексы для ускорения запросов
GoalSchema.index({ userId: 1, status: 1 });
GoalSchema.index({ userId: 1, deadline: 1 });

const Goal = mongoose.model('Goal', GoalSchema);

module.exports = Goal; 
const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		type: {
			type: String,
			enum: ['income', 'expense', 'transfer'],
			required: true,
		},
		amount: {
			type: Number,
			required: true,
		},
		categoryId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Category',
		},
		sourceId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'IncomeSource',
		},
		accountId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Account',
			required: true,
		},
		toAccountId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Account',
		},
		date: {
			type: Date,
			default: Date.now,
			required: true,
		},
		description: {
			type: String,
			trim: true,
		},
		status: {
			type: String,
			enum: ['active', 'archived'],
			default: 'active',
		},
	},
	{ timestamps: true },
);

// Индексы для улучшения производительности запросов
TransactionSchema.index({ userId: 1, date: -1 });
TransactionSchema.index({ userId: 1, accountId: 1 });
TransactionSchema.index({ userId: 1, categoryId: 1 });
TransactionSchema.index({ userId: 1, type: 1 });

const Transaction = mongoose.model('Transaction', TransactionSchema);

module.exports = Transaction;

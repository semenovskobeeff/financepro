const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		type: {
			type: String,
			enum: ['bank', 'deposit', 'goal', 'credit', 'subscription'],
			required: true,
		},
		name: {
			type: String,
			required: true,
			trim: true,
		},
		cardInfo: {
			type: String,
			trim: true,
		},
		balance: {
			type: Number,
			default: 0,
			required: true,
		},
		currency: {
			type: String,
			default: 'RUB',
		},
		status: {
			type: String,
			enum: ['active', 'archived'],
			default: 'active',
		},
		history: [
			{
				operationType: {
					type: String,
					enum: ['income', 'expense', 'transfer'],
					required: true,
				},
				amount: {
					type: Number,
					required: true,
				},
				date: {
					type: Date,
					default: Date.now,
				},
				description: String,
				linkedAccountId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Account',
				},
			},
		],
		createdAt: {
			type: Date,
			default: Date.now,
		},
	},
	{ timestamps: true },
);

// Индексы для ускорения запросов
AccountSchema.index({ userId: 1, status: 1 });
AccountSchema.index({ userId: 1, type: 1 });

const Account = mongoose.model('Account', AccountSchema);

module.exports = Account;

const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		name: {
			type: String,
			required: true,
			trim: true,
		},
		type: {
			type: String,
			enum: ['income', 'expense'],
			required: true,
		},
		icon: {
			type: String,
			default: 'category',
		},
		status: {
			type: String,
			enum: ['active', 'archived'],
			default: 'active',
		},
	},
	{ timestamps: true },
);

// Добавляем индекс для быстрого поиска
CategorySchema.index({ userId: 1, type: 1, status: 1 });

const Category = mongoose.model('Category', CategorySchema);

module.exports = Category;

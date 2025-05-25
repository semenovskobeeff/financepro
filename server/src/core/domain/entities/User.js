const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
		},
		password: {
			type: String,
			required: true,
		},
			resetPasswordToken: {
		type: String,
		default: undefined,
	},
	resetPasswordExpires: {
		type: Date,
		default: undefined,
	},
	resetPasswordUsed: {
		type: Boolean,
		default: undefined,
	},
		name: {
			type: String,
			required: true,
			trim: true,
		},
		roles: {
			type: [String],
			default: ['user'],
			enum: ['user', 'admin'],
		},
		settings: {
			primaryIncomeAccount: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Account',
			},
			primaryExpenseAccount: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Account',
			},
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{ timestamps: true },
);

// Хук pre-save для хеширования пароля
UserSchema.pre('save', async function (next) {
	// Хешируем пароль только если он был изменен или это новый пользователь
	if (!this.isModified('password')) {
		return next();
	}

	try {
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (error) {
		next(error);
	}
});

// Метод для проверки пароля
UserSchema.methods.comparePassword = async function (candidatePassword) {
	return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema);

module.exports = User;

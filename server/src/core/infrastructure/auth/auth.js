const jwt = require('jsonwebtoken');
const { User } = require('../../domain/entities');

/**
 * Middleware для проверки JWT токена и аутентификации пользователя
 */
const auth = async (req, res, next) => {
	try {
		// Получение токена из заголовка Authorization
		const authHeader = req.header('Authorization');

		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return res
				.status(401)
				.json({ message: 'Отсутствует токен авторизации' });
		}

		const token = authHeader.replace('Bearer ', '');

		// Верификация токена
		const decoded = jwt.verify(
			token,
			process.env.JWT_SECRET || 'default_jwt_secret',
		);

		// Поиск пользователя по ID из токена
		const user = await User.findById(decoded.id);

		if (!user) {
			return res.status(401).json({ message: 'Пользователь не найден' });
		}

		if (!user.isActive) {
			return res.status(401).json({ message: 'Аккаунт деактивирован' });
		}

		// Добавление объекта пользователя в request для дальнейшего использования
		req.user = user;
		req.token = token;

		next();
	} catch (error) {
		if (error.name === 'JsonWebTokenError') {
			return res.status(401).json({ message: 'Недействительный токен' });
		}

		if (error.name === 'TokenExpiredError') {
			return res
				.status(401)
				.json({ message: 'Срок действия токена истек' });
		}

		console.error('Auth middleware error:', error);
		res.status(500).json({ message: 'Ошибка сервера при авторизации' });
	}
};

/**
 * Middleware для проверки роли администратора
 */
const adminOnly = (req, res, next) => {
	if (!req.user || !req.user.roles.includes('admin')) {
		return res.status(403).json({
			message: 'Доступ запрещен. Требуются права администратора',
		});
	}

	next();
};

module.exports = { auth, adminOnly };

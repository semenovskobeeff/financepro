const { User } = require('../../../core/domain/entities');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

/**
 * Регистрация нового пользователя
 */
exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Проверка, существует ли уже пользователь с таким email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: 'Пользователь с таким email уже существует' });
    }

    // Создание нового пользователя
    const user = new User({
      email,
      password,
      name,
      roles: ['user'],
    });

    // Сохранение пользователя (хеширование пароля выполняется в pre-save)
    await user.save();

    // Генерация JWT токена
    const token = generateToken(user);

    // Возвращаем данные пользователя без пароля и токен
    const userResponse = {
      id: user._id,
      email: user.email,
      name: user.name,
      roles: user.roles,
    };

    res.status(201).json({ user: userResponse, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Ошибка при регистрации пользователя',
    });
  }
};

/**
 * Авторизация пользователя
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Поиск пользователя по email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    // Проверка активности пользователя
    if (!user.isActive) {
      return res.status(401).json({ message: 'Аккаунт деактивирован' });
    }

    // Проверка пароля
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    // Генерация JWT токена
    const token = generateToken(user);

    // Возвращаем данные пользователя без пароля и токен
    const userResponse = {
      id: user._id,
      email: user.email,
      name: user.name,
      roles: user.roles,
      settings: user.settings,
    };

    res.json({ user: userResponse, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Ошибка при входе в систему' });
  }
};

/**
 * Получение профиля пользователя
 */
exports.getProfile = async (req, res) => {
  try {
    // Поиск пользователя по ID из request.user (устанавливается в middleware auth)
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Ошибка при получении профиля' });
  }
};

/**
 * Обновление профиля пользователя
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, settings } = req.body;

    // Обновление только разрешенных полей
    const updates = {};
    if (name) updates.name = name;
    if (settings) updates.settings = settings;

    // Поиск и обновление пользователя
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Ошибка при обновлении профиля' });
  }
};

/**
 * Вспомогательная функция для генерации JWT токена
 */
const generateToken = user => {
  return jwt.sign(
    { id: user._id, email: user.email, roles: user.roles },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Функция для отправки email (замените на ваш реальный транспорт)
async function sendPasswordResetEmail(userEmail, token) {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    let info = await transporter.sendMail({
      from: '"Finance App" <noreply@financeapp.com>',
      to: userEmail,
      subject: 'Сброс пароля',
      text: `Вы запросили сброс пароля. Перейдите по ссылке: ${resetUrl}`,
      html: `<p>Вы запросили сброс пароля. Перейдите по ссылке: <a href="${resetUrl}">${resetUrl}</a></p>`,
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (err) {
    console.error('Ошибка отправки письма для сброса пароля:', err);
    throw err;
  }
}

/**
 * Запрос на сброс пароля
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email, isActive: true });

    if (user) {
      // Проверяем, не был ли недавно отправлен токен
      const now = Date.now();
      if (user.resetPasswordExpires && user.resetPasswordExpires > now) {
        const timeLeft = Math.ceil((user.resetPasswordExpires - now) / (1000 * 60)); // минуты
        if (timeLeft > 50) { // Если токен был создан менее 10 минут назад
          return res.status(429).json({
            message: `Токен для сброса пароля уже отправлен. Повторная отправка возможна через ${timeLeft - 50} минут.`,
          });
        }
      }

      const token = crypto.randomBytes(20).toString('hex');
      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 час
      user.resetPasswordUsed = false; // Добавляем флаг использования
      await user.save();

      try {
        await sendPasswordResetEmail(user.email, token);
        console.log(`Password reset email sent to: ${user.email}`);
      } catch (mailErr) {
        console.error('Ошибка при отправке письма (forgotPassword):', mailErr);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.resetPasswordUsed = undefined;
        await user.save();

        return res.status(500).json({
          message: 'Ошибка при отправке письма. Попробуйте позже.',
        });
      }
    }

    // Всегда возвращаем одинаковое сообщение для безопасности
    res.status(200).json({
      message:
        'Если ваш email зарегистрирован, вы получите письмо для сброса пароля.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Ошибка при запросе на сброс пароля' });
  }
};

/**
 * Сброс пароля
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
      resetPasswordUsed: { $ne: true }, // Проверяем, что токен не использован
      isActive: true,
    });

    if (!user) {
      return res.status(400).json({
        message: 'Токен для сброса пароля недействителен, истек или уже был использован.'
      });
    }

    // Проверяем, что новый пароль отличается от старого
    const isSamePassword = await user.comparePassword(password);
    if (isSamePassword) {
      return res.status(400).json({
        message: 'Новый пароль должен отличаться от текущего.'
      });
    }

    user.password = password; // Пароль будет хеширован pre-save хуком
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.resetPasswordUsed = true; // Помечаем токен как использованный
    await user.save();

    console.log(`Password successfully reset for user: ${user.email}`);

    res.status(200).json({ message: 'Пароль успешно сброшен.' });
  } catch (error) {
    console.error('Reset password error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Ошибка валидации: ' + error.message
      });
    }
    res.status(500).json({ message: 'Ошибка при сбросе пароля' });
  }
};

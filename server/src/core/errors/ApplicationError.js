/**
 * Класс для обработки ошибок приложения
 */
class ApplicationError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Сохраняем стек вызовов
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApplicationError;

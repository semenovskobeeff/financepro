const express = require('express');
const router = express.Router();
const archiveController = require('../controllers/archiveController');
const { auth } = require('../../../core/infrastructure/auth/auth');

/**
 * @swagger
 * tags:
 *   name: Archive
 *   description: API для работы с архивом
 */

// Получение статистики архива
router.get('/stats', auth, archiveController.getArchiveStats);

// Получение архивных объектов по типу
router.get('/:type', auth, archiveController.getArchivedItems);

// Восстановление объекта из архива
router.patch('/:type/:id/restore', auth, archiveController.restoreFromArchive);

// Полное удаление объекта из архива
router.delete('/:type/:id', auth, archiveController.deleteFromArchive);

module.exports = router;

const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');
const { auth } = require('../../../core/infrastructure/auth/auth');

/**
 * @swagger
 * tags:
 *   name: Goals
 *   description: API для управления целями накопления
 */

/**
 * @swagger
 * /api/v1/goals:
 *   get:
 *     tags:
 *       - Goals
 *     summary: Get all user goals
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, cancelled, archived]
 *         description: Filter goals by status
 *     responses:
 *       200:
 *         description: List of goals
 */
router.get('/', auth, goalController.getGoals);

/**
 * @swagger
 * /api/v1/goals/{id}:
 *   get:
 *     tags:
 *       - Goals
 *     summary: Get goal by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Goal details
 *       404:
 *         description: Goal not found
 */
router.get('/:id', auth, goalController.getGoalById);

/**
 * @swagger
 * /api/v1/goals:
 *   post:
 *     tags:
 *       - Goals
 *     summary: Create new goal
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - accountId
 *               - targetAmount
 *               - deadline
 *             properties:
 *               name:
 *                 type: string
 *               accountId:
 *                 type: string
 *               targetAmount:
 *                 type: number
 *               deadline:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Goal created
 */
router.post('/', auth, goalController.createGoal);

/**
 * @swagger
 * /api/v1/goals/{id}:
 *   put:
 *     tags:
 *       - Goals
 *     summary: Update goal
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               targetAmount:
 *                 type: number
 *               deadline:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Goal updated
 *       404:
 *         description: Goal not found
 */
router.put('/:id', auth, goalController.updateGoal);

/**
 * @swagger
 * /api/v1/goals/{id}/archive:
 *   put:
 *     tags:
 *       - Goals
 *     summary: Archive goal
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Goal archived
 *       404:
 *         description: Goal not found
 */
router.put('/:id/archive', auth, goalController.archiveGoal);

/**
 * @swagger
 * /api/v1/goals/{id}/restore:
 *   put:
 *     tags:
 *       - Goals
 *     summary: Restore goal from archive
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Goal restored
 *       404:
 *         description: Goal not found
 */
router.put('/:id/restore', auth, goalController.restoreGoal);

/**
 * @swagger
 * /api/v1/goals/{id}/transfer:
 *   post:
 *     tags:
 *       - Goals
 *     summary: Transfer funds to goal
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fromAccountId
 *               - amount
 *             properties:
 *               fromAccountId:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Funds transferred successfully
 *       400:
 *         description: Invalid transfer data
 *       404:
 *         description: Goal or account not found
 */
router.post('/:id/transfer', auth, goalController.transferToGoal);

module.exports = router;

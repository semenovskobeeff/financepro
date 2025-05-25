const goalService = require('../services/goalService');

/**
 * @swagger
 * /api/v1/goals:
 *   get:
 *     tags:
 *       - Goals
 *     summary: Get user goals
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
 *         description: A list of goals
 */
const getGoals = async (req, res) => {
  try {
    const { status } = req.query;
    const goals = await goalService.getUserGoals(req.user._id, status);
    res.status(200).json(goals);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Ошибка при получении целей', error: error.message });
  }
};

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
const getGoalById = async (req, res) => {
  try {
    const goal = await goalService.getGoalById(req.params.id, req.user._id);

    if (!goal) {
      return res.status(404).json({ message: 'Цель не найдена' });
    }

    res.status(200).json(goal);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Ошибка при получении цели', error: error.message });
  }
};

/**
 * @swagger
 * /api/v1/goals:
 *   post:
 *     tags:
 *       - Goals
 *     summary: Create a new goal
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
 *     responses:
 *       201:
 *         description: Goal created successfully
 */
const createGoal = async (req, res) => {
  try {
    const newGoal = await goalService.createGoal(req.body, req.user._id);
    res.status(201).json(newGoal);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Ошибка при создании цели', error: error.message });
  }
};

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
 *     responses:
 *       200:
 *         description: Goal updated successfully
 *       404:
 *         description: Goal not found
 */
const updateGoal = async (req, res) => {
  try {
    const updatedGoal = await goalService.updateGoal(
      req.params.id,
      req.body,
      req.user._id
    );
    res.status(200).json(updatedGoal);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

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
 *         description: Goal archived successfully
 *       404:
 *         description: Goal not found
 */
const archiveGoal = async (req, res) => {
  try {
    const goal = await goalService.archiveGoal(req.params.id, req.user._id);
    res.status(200).json(goal);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

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
 *         description: Goal restored successfully
 *       404:
 *         description: Goal not found
 */
const restoreGoal = async (req, res) => {
  try {
    const goal = await goalService.restoreGoal(req.params.id, req.user._id);
    res.status(200).json(goal);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

/**
 * @swagger
 * /api/v1/goals/{id}/transfer:
 *   post:
 *     tags:
 *       - Goals
 *     summary: Transfer money to goal
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
 *     responses:
 *       200:
 *         description: Transfer successful
 */
const transferToGoal = async (req, res) => {
  try {
    const { fromAccountId, amount } = req.body;

    const result = await goalService.transferToGoal(
      req.params.id,
      fromAccountId,
      amount,
      req.user._id
    );

    res.status(200).json({
      message: 'Перевод выполнен успешно',
      ...result,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  archiveGoal,
  restoreGoal,
  transferToGoal,
};

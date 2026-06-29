const express = require('express');
const authenticate = require('../../middleware/authMiddleware');
const authorise = require('../../middleware/roleMiddleware');
const userService = require('./user.service');
const ApiResponse = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 */
router.get(
  '/',
  authenticate,
  authorise('ADMIN'),
  asyncHandler(async (req, res) => {
    const users = await userService.getAllUsers();
    ApiResponse.success(res, users, 'Users retrieved successfully');
  })
);

module.exports = router;

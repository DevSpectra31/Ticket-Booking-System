const { body, query } = require('express-validator');

const createEventValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('venue').trim().notEmpty().withMessage('Venue is required'),
  body('eventDate').isISO8601().withMessage('Valid event date is required'),
  body('eventTime').trim().notEmpty().withMessage('Event time is required'),
  body('posterUrl').optional({ checkFalsy: true }).isURL().withMessage('Poster URL must be a valid URL'),
  body('status')
    .optional()
    .isIn(['UPCOMING', 'ACTIVE', 'SOLD_OUT', 'COMPLETED', 'CANCELLED'])
    .withMessage('Invalid status'),
];

const updateEventValidation = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('venue').optional().trim().notEmpty().withMessage('Venue cannot be empty'),
  body('eventDate').optional().isISO8601().withMessage('Valid event date is required'),
  body('eventTime').optional().trim().notEmpty().withMessage('Event time cannot be empty'),
  body('posterUrl').optional({ checkFalsy: true }).isURL().withMessage('Poster URL must be a valid URL'),

  body('status')
    .optional()
    .isIn(['UPCOMING', 'ACTIVE', 'SOLD_OUT', 'COMPLETED', 'CANCELLED'])
    .withMessage('Invalid status'),
];

const searchEventsValidation = [
  query('search').optional().trim(),
  query('status').optional().isIn(['UPCOMING', 'ACTIVE', 'SOLD_OUT', 'COMPLETED', 'CANCELLED']),
  query('date').optional().isISO8601(),
];

module.exports = { createEventValidation, updateEventValidation, searchEventsValidation };

import { body, check } from 'express-validator';

export const createTaskValidator = [
  check('tittle').isString().trim().notEmpty(),
  check('priority').isNumeric(),
];

export const updateTaskValidator = [
  body('tittle').exists().trim().notEmpty().isString(),
  body('priority').exists().not().isString().isInt(),
  body('completed').exists().notEmpty().isBoolean(),
];

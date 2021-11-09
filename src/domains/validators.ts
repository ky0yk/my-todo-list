import { body } from 'express-validator';

export const createTaskValidator = [
  body('tittle').exists().trim().notEmpty().isString(),
  body('priority').exists().not().isString().isInt(),
];

export const updateTaskValidator = [
  body('tittle').exists().trim().notEmpty().isString(),
  body('priority').exists().not().isString().isInt(),
  body('completed').exists().notEmpty().isBoolean(),
];

import { body, check } from 'express-validator';

export const createTaskValidator = [
  check('tittle').isString().trim().notEmpty(),
  check('priority').isNumeric(),
];

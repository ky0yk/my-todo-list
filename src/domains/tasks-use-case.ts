import jwtDecode, { JwtPayload } from 'jwt-decode';

import { Express, Request, Response, NextFunction } from 'express';
import * as ddb from '../infrastructures/dynamodb/tasks-table';
import { Task } from '../utils/types';
import { time } from 'console';

export const healthCheck = (req: Request, res: Response): void => {
  res.json({ message: 'API is working!' });
};

export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // TODO: バリデーションをいれる
  const token = req.headers['authorization'];
  const decoded = jwtDecode<JwtPayload>(token!);
  const taskInfo: Task = req.body;
  taskInfo.user = decoded.sub;

  const currentTime: string = new Date().toISOString();
  taskInfo.createdAt = currentTime;
  taskInfo.updatedAt = currentTime;

  try {
    const result: Task = await ddb.createTask(taskInfo);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

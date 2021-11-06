import jwtDecode, { JwtPayload } from 'jwt-decode';

import { Express, Request, Response, NextFunction } from 'express';
import * as ddb from '../infrastructures/dynamodb/tasks-table';
import { Task, TaskSummary, UpdateTaskInfo } from '../utils/types';
import { validationResult } from 'express-validator';

export const healthCheck = (req: Request, res: Response): void => {
  res.json({ message: 'API is working!' });
};

const getUser = (req: Request): string => {
  const token = req.headers['authorization'];
  return jwtDecode<JwtPayload>(token!).sub!;
};

const validation = (req: Request, res: Response): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
};

export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  validation(req, res);
  const taskInfo: Task = req.body;
  taskInfo.user = getUser(req);

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

export const getTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user: string = getUser(req);
  try {
    const result: Task = await ddb.getTask(user, req.params.id);
    result
      ? res.json(result)
      : res.status(404).json('Sorry cant find the task!');
  } catch (err) {
    next(err);
  }
};

export const getTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user: string = getUser(req);
  try {
    const result: TaskSummary[] = await ddb.getTasks(user);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user: string = getUser(req);
  validation(req, res);

  // オブジェクトのサブセットを取得し、不要なプロパティを削除
  const updateTaskInfo: UpdateTaskInfo = (({
    tittle,
    body,
    priority,
    completed,
  }) => ({
    tittle,
    body,
    priority,
    completed,
  }))(req.body);

  // bodyがない場合には空文字を追加する
  updateTaskInfo.body ? updateTaskInfo.body : (updateTaskInfo.body = '');

  // タイムスタンプを付与
  const currentTime: string = new Date().toISOString();
  updateTaskInfo.updatedAt = currentTime;

  try {
    const result: Task = await ddb.updateTask(
      user,
      req.params.id,
      updateTaskInfo
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

import jwtDecode, { JwtPayload } from 'jwt-decode';

import { Express, Request, Response, NextFunction } from 'express';
import * as ddb from '../infrastructures/dynamodb/tasks-table';
import {
  CreateTaskInfo,
  Task,
  TaskSummary,
  UpdateTaskInfo,
} from '../utils/types';
import { validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';

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
): Promise<Response | void> => {
  validation(req, res);

  // リクエストボディに対して、（必要あれば）タスクの本文を補完
  const preCreateTaskInfo = req.body;
  preCreateTaskInfo.body = preCreateTaskInfo.body || '';

  // オブジェクトのサブセットを取得し、不要なプロパティを削除
  const createTaskInfo: CreateTaskInfo = (({ tittle, body, priority }) => ({
    tittle,
    body,
    priority,
  }))(preCreateTaskInfo);

  // タイムスタンプを付与
  const currentTime: string = new Date().toISOString();

  const taskInfo: Task = {
    ...createTaskInfo,
    id: uuidv4(),
    user: getUser(req),
    completed: false,
    createdAt: currentTime,
    updatedAt: currentTime,
  };

  try {
    const result: Task = await ddb.createTask(taskInfo);
    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const getTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const user: string = getUser(req);
  try {
    const result: Task | undefined = await ddb.getTask(user, req.params.id);
    if (result) {
      return res.json(result);
    } else {
      res.status(404).json('Sorry cant find the task!');
    }
  } catch (err) {
    next(err);
  }
};

export const getTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const user: string = getUser(req);
  try {
    const result: TaskSummary[] = await ddb.getTasks(user);
    // 優先度が若い順にソート
    result.sort((a, b) =>
      a.priority < b.priority ? -1 : a.priority > b.priority ? 1 : 0
    );
    return res.json(result);
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const user: string = getUser(req);
  validation(req, res);

  // DBに該当するタスクが存在することを担保
  try {
    const result: Task | undefined = await ddb.getTask(user, req.params.id);
    if (!result) {
      return res.status(404).json('Sorry cant find the task!');
    }
  } catch (err) {
    next(err);
  }

  // リクエストボディに対して、タイムスタンプと（必要あれば）タスクの本文を補完
  const preUpdateTaskInfo = req.body;
  preUpdateTaskInfo.updatedAt = new Date().toISOString();
  preUpdateTaskInfo.body = preUpdateTaskInfo.body || '';

  // オブジェクトのサブセットを取得し、不要なプロパティを削除
  const updateTaskInfo: UpdateTaskInfo = (({
    tittle,
    body,
    priority,
    completed,
    updatedAt,
  }) => ({
    tittle,
    body,
    priority,
    completed,
    updatedAt,
  }))(preUpdateTaskInfo);

  try {
    const result: Task = await ddb.updateTask(
      user,
      req.params.id,
      updateTaskInfo
    );
    return res.json(result);
  } catch (err) {
    next(err);
  }
};

export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const user: string = getUser(req);
  try {
    const result = await ddb.deleteTask(user, req.params.id);
    if (result) {
      return res.status(204).json('{}');
    } else {
      return res.status(404).json('Sorry cant find the task!');
    }
  } catch (err) {
    next(err);
  }
};

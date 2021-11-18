import express = require('express');
import { Express, Request, Response, NextFunction } from 'express';
import * as tuc from '../domains/tasks-use-case';
import { createTaskValidator, updateTaskValidator } from './validators';

const app: Express = express().disable('x-powered-by');
const morgan = require('morgan');

app.use(express.json());
app.use(morgan('combined'));

app.get('/tasks', tuc.getTasks);
app.post('/tasks', createTaskValidator, tuc.createTask);

app.get('/tasks/:id', tuc.getTask);
app.put('/tasks/:id', updateTaskValidator, tuc.updateTask);
app.delete('/tasks/:id', tuc.deleteTask);

// error handler
app.use(
  (err: any, req: Request, res: Response, next: NextFunction): Response => {
    console.error(err);
    return res.status(500).json('Internal Server Error');
  }
);

module.exports = app;

import express = require('express');
import { Express, Request, Response, NextFunction } from 'express';
import * as tuc from './tasks-use-case';
import { createTaskValidator } from './validators';

const app: Express = express().disable('x-powered-by');
const morgan = require('morgan');

app.use(express.json());
app.use(morgan('combined'));

app.get('/', tuc.healthCheck);

app.get('/tasks', tuc.getTasks);
app.post('/tasks', createTaskValidator, tuc.createTask);

app.get('/tasks/:id', tuc.getTask);

// error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  res.status(500).json('Internal Server Error');
});

module.exports = app;

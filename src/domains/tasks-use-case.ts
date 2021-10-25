import { Express, Request, Response, NextFunction } from 'express';

export const healthCheck = (req: Request, res: Response): void => {
  res.json({ message: 'API is working!' });
};

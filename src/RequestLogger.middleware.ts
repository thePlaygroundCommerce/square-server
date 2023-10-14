import { Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export function RequestLogger(req: Request, res: Response, next: NextFunction) {
  const logger = new Logger();
  logger.log(`${req.method} Request To ${req.url} Received`);
  next();
};
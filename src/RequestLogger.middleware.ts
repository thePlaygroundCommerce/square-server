import { Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export function RequestLogger(
  { method, url }: Request,
  res: Response,
  next: NextFunction,
) {
  const logger = new Logger();
  logger.log(`${method} Request To ${url} Received`);

  res.on('close', () => {
    logger.log(`${method} ${url} ${res.statusCode} ${res.statusMessage}`);
  });
  next();
}

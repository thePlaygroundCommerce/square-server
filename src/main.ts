import { NestFactory } from '@nestjs/core';
import * as winston from 'winston';
import { AppModule } from './app.module';
import { RequestLogger } from './RequestLogger.middleware';

(BigInt.prototype as any).toJSON = function () {
  return +this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // logger: winston.createLogger({
    //   level: 'info',
    //   format: winston.format.json(),
    //   defaultMeta: { service: 'user-service' },
    //   transports: [
    //     //
    //     // - Write all logs with importance level of `error` or less to `error.log`
    //     // - Write all logs with importance level of `info` or less to `combined.log`
    //     //
    //     new winston.transports.File({ filename: 'error.log', level: 'error' }),
    //     new winston.transports.File({ filename: 'combined.log' }),
    //   ],
    // }),
  });
  app.enableCors();
  app.use(RequestLogger);
  await app.listen(process.env.PORT || 3000);
}

bootstrap();

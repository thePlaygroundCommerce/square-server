import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RequestLogger } from './RequestLogger.middleware';

(BigInt.prototype as any).toJSON = function() {
  return +this.toString()
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors()
  app.use(RequestLogger)
  await app.listen(process.env.PORT || 3000);
}

bootstrap();

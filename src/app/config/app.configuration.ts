import { INestApplication, ValidationPipe } from '@nestjs/common';

export default (appConfiguration: INestApplication) => {
  appConfiguration.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
};

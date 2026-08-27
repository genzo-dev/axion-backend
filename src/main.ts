import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import configureApp from './app/config/app.configuration';
import helmet from 'helmet';
import { parseCorsWhitelist } from './common/utils/parse-cors-whitelist';
import { TooManyRequestsFilter } from './common/filters/too-many-requests.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);

  // Configuração do CORS via Helmet

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  const corsWhiteList = parseCorsWhitelist(process.env.CORS_WHITE_LIST ?? '');

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (...args: any[]) => void,
    ) => {
      if (!origin || corsWhiteList.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'), false);
    },
  });

  // Configuração do Swagger

  const documentBuildConfig = new DocumentBuilder()
    .setTitle('Axion API - ' + process.env.NODE_ENV)
    .setDescription(
      'Documentação de endpoints da API do Axion, um sistema de trilhas focado no aprendizado autodidata',
    )
    .setVersion('0.1')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, documentBuildConfig);

  SwaggerModule.setup('docs', app, document);

  app.useGlobalFilters(new TooManyRequestsFilter());

  await app.listen(process.env.LOCAL_PORT_APP ?? 3001, '0.0.0.0');
}
bootstrap();

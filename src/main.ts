import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  await app.listen(process.env.LOCAL_PORT_APP ?? 3001, '0.0.0.0');
}
bootstrap();

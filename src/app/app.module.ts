import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigType } from '@nestjs/config';
import appConfig from './app.config';
import * as Joi from 'joi';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { UploadFileModule } from 'src/upload-file/upload-file.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

const isTest = process.env.NODE_ENV === 'test';

console.log('__dirname:', __dirname);
console.log('pictures:', join(__dirname, '..', 'pictures'));

@Module({
  imports: [
    AuthModule,
    UsersModule,
    UploadFileModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'pictures'),
      serveRoot: '/pictures',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_TYPE: Joi.required(),
        DATABASE_HOST: Joi.required(),
        DATABASE_PORT: Joi.number().default(5432),
        DATABASE_USER: Joi.required(),
        DATABASE_PASSWORD: Joi.required(),
        DATABASE_AUTO_LOAD_ENTITIES: Joi.number().min(0).max(1).default(0),
        DATABASE_SYNCHRONIZE: Joi.number().min(0).max(1).default(0),
      }),
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 10000,
        limit: isTest ? 10000 : 3,
      },
      {
        name: 'medium',
        ttl: 60000,
        limit: isTest ? 10000 : 20,
      },
      {
        name: 'long',
        ttl: 900000,
        limit: isTest ? 10000 : 100,
      },
    ]),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forFeature(appConfig)],
      inject: [appConfig.KEY],
      useFactory: async (appConfiguration: ConfigType<typeof appConfig>) => {
        return {
          type: appConfiguration.database.type,
          host: appConfiguration.database.host,
          port: appConfiguration.database.port,
          username: appConfiguration.database.username,
          password: appConfiguration.database.password,
          database: appConfiguration.database.database,
          autoLoadEntities: appConfiguration.database.autoLoadEntities,
          synchronize: appConfiguration.database.synchronize,
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { UploadFileService } from './upload-file.service';
import { UploadFileController } from './upload-file.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import emailCodeConfig from 'src/app/config/email-code.config';
import jwtConfig from 'src/auth/config/jwt.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    AuthModule,
    ConfigModule.forFeature(jwtConfig),
  ],
  controllers: [UploadFileController],
  providers: [UploadFileService],
  exports: [UploadFileService],
})
export class UploadFileModule {}

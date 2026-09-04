import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import emailCodeConfig from 'src/app/config/email-code.config';
import { EmailModule } from 'src/email/email.module';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import jwtConfig from 'src/auth/config/jwt.config';
import { UploadFileService } from 'src/upload-file/upload-file.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    AuthModule,
    ConfigModule.forFeature(emailCodeConfig),
    ConfigModule.forFeature(jwtConfig),
    EmailModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, AuthTokenGuard, UploadFileService],
  exports: [UsersService],
})
export class UsersModule {}

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { HashingService } from './hashing/hashing.service';
import { BcryptService } from './hashing/bcrypt.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { JwtModule, JwtService } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';
import { ConfigModule } from '@nestjs/config';
import emailCodeConfig from 'src/app/config/email-code.config';
import { EmailModule } from 'src/email/email.module';
import resetPasswordConfig from './config/reset-password.config';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: HashingService,
      useClass: BcryptService,
    },
  ],
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(resetPasswordConfig),
    ConfigModule.forFeature(emailCodeConfig),
    EmailModule,
  ],
  exports: [AuthService, HashingService, TypeOrmModule, JwtModule],
})
export class AuthModule {}

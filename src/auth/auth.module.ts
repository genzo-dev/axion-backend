import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { HashingService } from './hashing/hashing.service';
import { BcrypService } from './hashing/bcrypt.service';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: HashingService,
      useClass: BcrypService,
    },
  ],
  exports: [AuthService, HashingService],
  imports: [AuthModule],
})
export class AuthModule {}

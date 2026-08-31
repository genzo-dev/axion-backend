import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import jwtConfig from '../config/jwt.config';
import type { ConfigType } from '@nestjs/config';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { REQUEST_TOKEN_PAYLOAD_KEY, REQUEST_USER_KEY } from '../auth.contants';

@Injectable()
export class AuthTokenGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Usuário não logado');
    }

    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        this.jwtConfiguration,
      );

      const user = await this.usersRepository.findOneBy({
        uuid: payload.sub,
        isVerified: true,
        isActive: true,
      });

      if (!user) {
        throw new UnauthorizedException('Pessoa não autorizada');
      }

      request.user = user;
      payload[REQUEST_USER_KEY] = user;
      request[REQUEST_TOKEN_PAYLOAD_KEY] = payload;
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Falha ao logar');
    }

    return true;
  }
  extractTokenFromHeader(request: Request): string | undefined {
    const authorization = request.headers?.authorization;

    if (!authorization || typeof authorization !== 'string') {
      return;
    }

    return authorization.split(' ')[1];
  }
}

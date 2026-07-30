import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { HashingService } from './hashing/hashing.service';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';
import type { ConfigType } from '@nestjs/config';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly hashingService: HashingService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    let passwordIsValid = false;

    const isEmail: boolean = loginDto.indentifier.includes('@');

    const identifierObj = isEmail
      ? { email: loginDto.indentifier, isValid: true }
      : { username: loginDto.indentifier, isValid: true };

    const user = await this.usersRepository.findOneBy(identifierObj);

    if (user) {
      passwordIsValid = await this.hashingService.compare(
        loginDto.password,
        user.passwordHash,
      );
    }

    if (!user || !passwordIsValid) {
      throw new UnauthorizedException('E-mail, username ou senha inválidos');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('Usuário não verificado no sistema.');
    }

    return this.createTokens(user);
  }

  private async createTokens(user: User) {
    const accessTokenPromise = this.signJwtAsync(
      user.uuid,
      this.jwtConfiguration.jwtTtl,
    );

    const refreshTokenPromise = this.signJwtAsync(
      user.uuid,
      this.jwtConfiguration.jwtRefreshTtl,
    );

    const [accessToken, refreshToken] = await Promise.all([
      accessTokenPromise,
      refreshTokenPromise,
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async signJwtAsync<T>(sub: string, expiresIn: number, payload?: T) {
    return await this.jwtService.signAsync(
      {
        sub,
        ...payload,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn,
      },
    );
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    try {
      const { sub } = await this.jwtService.verifyAsync(
        refreshTokenDto.refreshToken,
        this.jwtConfiguration,
      );

      const user = await this.usersRepository.findOneBy({
        uuid: sub,
        isValid: true,
      });

      if (!user) {
        throw new UnauthorizedException('Usuário não autorizado');
      }

      return this.createTokens(user);
    } catch (error) {
      if (error instanceof Error) {
        throw new UnauthorizedException(error);
      }
    }
  }
}

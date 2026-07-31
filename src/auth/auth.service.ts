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
import { ValidateCodeDto } from './dto/validate-code.dto';
import { ResendCodeDto } from './dto/resend-code.dto';
import { generateValidationUserCode } from 'src/common/utils/generate-validation-user-code';

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
        isVerified: true,
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

  async validateAccount(validateCodeDto: ValidateCodeDto) {
    try {
      const user = await this.usersRepository.findOneBy({
        email: validateCodeDto.validateEmail,
      });

      if (!user) {
        throw new UnauthorizedException('Usuário não cadastrado');
      }

      if (!user.vericationCode) {
        throw new UnauthorizedException('Nenhum código ativo');
      }

      if (user.isVerified) {
        throw new UnauthorizedException('Conta já verificada');
      }

      if (user.validTimeCode && user.validTimeCode < new Date()) {
        throw new UnauthorizedException('Código expirado');
      }

      if (user.vericationCode !== validateCodeDto.validateCode) {
        throw new UnauthorizedException('Código inválido');
      }

      user.isVerified = true;
      user.validTimeCode = null;
      user.vericationCode = null;
      user.resendTimeCode = null;

      const validUser = await this.usersRepository.save(user);

      return this.createTokens(validUser);
    } catch (error) {
      throw error;
    }
  }

  async resendCode(resendCodeDto: ResendCodeDto) {
    try {
      const user = await this.usersRepository.findOneBy({
        email: resendCodeDto.validateEmail,
      });

      if (!user) {
        throw new UnauthorizedException('Usuário não cadastrado');
      }

      if (user.isVerified) {
        throw new UnauthorizedException('Conta já verificada');
      }

      if (user.resendTimeCode && user.resendTimeCode > new Date()) {
        throw new UnauthorizedException(
          'Aguarde para pedir seu código novamente',
        );
      }

      const newUserValidateCode = generateValidationUserCode();
      user.resendTimeCode = new Date(Date.now() + 30 * 1000);
      user.validTimeCode = new Date(Date.now() + 15 * 60 * 1000);

      user.vericationCode = newUserValidateCode;

      const validUser = await this.usersRepository.save(user);

      if (process.env.NODE_ENV === 'development') {
        console.log('NOVO CÓDIGO: ', validUser.vericationCode);
      }

      return { message: 'Código reenviado com sucesso' };
    } catch (error) {
      throw error;
    }
  }
}

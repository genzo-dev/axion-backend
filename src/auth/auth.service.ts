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
import emailCodeConfig from '../app/config/email-code.config';
import { ChangePasswordDto } from './dto/change-password.dto';
import resetPasswordConfig from './config/reset-password.config';
import { EmailService } from 'src/email/email.service';
import { SendEmailDto } from 'src/email/dto/send-email.dto';
import { buildResetPasswordEmail } from 'src/email/templates/reset-password.template';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { buildValidationCodeEmail } from 'src/email/templates/validation-code.template';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly hashingService: HashingService,
    private readonly emailService: EmailService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly jwtService: JwtService,
    @Inject(emailCodeConfig.KEY)
    private readonly emailCodeConfiguration: ConfigType<typeof emailCodeConfig>,
    @Inject(resetPasswordConfig.KEY)
    private readonly resetPasswordConfiguration: ConfigType<
      typeof resetPasswordConfig
    >,
  ) {}

  async login(loginDto: LoginDto) {
    let passwordIsValid = false;

    const isEmail: boolean = loginDto.indentifier.includes('@');

    const identifierObj = isEmail
      ? { email: loginDto.indentifier, isActive: true }
      : { username: loginDto.indentifier, isActive: true };

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

  private async createTokens(user: User, oldJti?: string) {
    const jti = randomUUID();

    const accessTokenPromise = this.signJwtAsync(
      user.uuid,
      this.jwtConfiguration.jwtTtl,
    );

    const refreshTokenPromise = this.signJwtAsync(
      user.uuid,
      this.jwtConfiguration.jwtRefreshTtl,
      jti,
    );

    const [accessToken, refreshToken] = await Promise.all([
      accessTokenPromise,
      refreshTokenPromise,
    ]);

    if (oldJti) {
      const result = await this.usersRepository.update(
        {
          uuid: user.uuid,
          isActive: true,
          isVerified: true,
          refreshTokenJti: oldJti,
        },
        {
          refreshTokenJti: jti,
        },
      );

      if (result.affected !== 1) {
        new UnauthorizedException('Refresh token inválido');
      }
    } else {
      user.refreshTokenJti = jti;
      await this.usersRepository.save(user);
    }

    return {
      accessToken,
      refreshToken,
    };
  }

  private async signJwtAsync<T>(
    sub: string,
    expiresIn: number,
    jti?: string,
    payload?: T,
    options?: {
      secret: string;
      audience?: string;
      issuer?: string;
    },
  ) {
    return await this.jwtService.signAsync(
      {
        sub,
        jti,
        ...payload,
      },
      {
        audience: options?.audience ?? this.jwtConfiguration.audience,
        issuer: options?.issuer ?? this.jwtConfiguration.issuer,
        secret: options?.secret ?? this.jwtConfiguration.secret,
        expiresIn,
      },
    );
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    try {
      const { sub, jti } = await this.jwtService.verifyAsync(
        refreshTokenDto.refreshToken,
        this.jwtConfiguration,
      );

      const user = await this.usersRepository.findOneBy({
        uuid: sub,
        isActive: true,
        isVerified: true,
      });

      if (!user) {
        throw new UnauthorizedException('Usuário não autorizado');
      }

      return this.createTokens(user, jti);
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

      if (!user.verificationCode) {
        throw new UnauthorizedException('Nenhum código ativo');
      }

      if (user.isVerified) {
        throw new UnauthorizedException('Conta já verificada');
      }

      if (user.validTimeCode && user.validTimeCode < new Date()) {
        throw new UnauthorizedException('Código expirado');
      }

      if (
        await this.hashingService.compare(
          validateCodeDto.validateCode,
          user.verificationCode,
        )
      ) {
        user.isVerified = true;
        user.validTimeCode = null;
        user.verificationCode = null;
        user.resendTimeCode = null;
      } else {
        throw new UnauthorizedException('Código inválido');
      }

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
      user.resendTimeCode = new Date(
        Date.now() +
          this.emailCodeConfiguration.emailCodeResendBlockTime * 1000,
      );
      user.validTimeCode = new Date(
        Date.now() + this.emailCodeConfiguration.emailCodeExpiresAt * 1000,
      );

      user.verificationCode =
        await this.hashingService.hash(newUserValidateCode);

      const { html, attachments } =
        buildValidationCodeEmail(newUserValidateCode);
      const newSendEmailDto: SendEmailDto = {
        to: user.email,
        subject: 'Axion · Confirme seu e-mail',
        html,
        attachments,
      };

      await this.emailService.sendEmail(newSendEmailDto);

      if (process.env.NODE_ENV === 'development') {
        console.log('NOVO CÓDIGO: ', newUserValidateCode);
      }

      await this.usersRepository.save(user);

      return { message: 'Código reenviado com sucesso' };
    } catch (error) {
      throw error;
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersRepository.findOneBy({
      email: forgotPasswordDto.email,
      isActive: true,
      isVerified: true,
    });

    if (!user) {
      throw new UnauthorizedException(
        'Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.',
      );
    }

    const jti = randomUUID();

    const resetPasswordToken = await this.signJwtAsync(
      user.uuid,
      this.resetPasswordConfiguration.jwtTtl,
      jti,
      undefined,
      {
        secret: this.resetPasswordConfiguration.secret,
        audience: this.resetPasswordConfiguration.audience,
        issuer: this.resetPasswordConfiguration.issuer,
      },
    );

    user.resetPasswordJti = jti;
    await this.usersRepository.save(user);

    const resetLink = `${this.resetPasswordConfiguration.frontUrl}/reset-password?token=${resetPasswordToken}`;

    const { html, attachments } = buildResetPasswordEmail(resetLink);
    const newSendEmailDto: SendEmailDto = {
      to: user.email,
      subject: 'Axion · Redefinição de senha',
      html: html,
      attachments,
    };

    await this.emailService.sendEmail(newSendEmailDto);

    return { message: 'E-mail de redefinição de senha enviado com sucesso' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    let decoded: { sub: string; jti: string };

    try {
      decoded = await this.jwtService.verifyAsync(resetPasswordDto.token, {
        secret: this.resetPasswordConfiguration.secret,
        audience: this.resetPasswordConfiguration.audience,
        issuer: this.resetPasswordConfiguration.issuer,
      });
    } catch {
      throw new UnauthorizedException(
        'Link inválido ou expirado. Solicite um novo link de redefinição.',
      );
    }

    const user = await this.usersRepository.findOneBy({
      uuid: decoded.sub,
      isActive: true,
      isVerified: true,
      resetPasswordJti: decoded.jti,
    });

    if (!user) {
      throw new UnauthorizedException(
        'Link inválido ou expirado. Solicite um novo link de redefinição.',
      );
    }

    user.passwordHash = await this.hashingService.hash(
      resetPasswordDto.newPassword,
    );

    user.resetPasswordJti = null;
    await this.usersRepository.save(user);

    return {
      message: 'Senha redefinida com sucesso. Faça login com sua nova senha.',
    };
  }

  async changePassword(user: User, changePasswordDto: ChangePasswordDto) {
    const passwordIsValid = await this.hashingService.compare(
      changePasswordDto.password,
      user.passwordHash,
    );

    if (!passwordIsValid) {
      throw new UnauthorizedException('Senha atual inválida');
    }

    user.passwordHash = await this.hashingService.hash(
      changePasswordDto.newPassword,
    );

    await this.usersRepository.save(user);

    return { message: 'Senha alterada com sucesso' };
  }
}

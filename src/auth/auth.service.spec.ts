import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { HashingService } from './hashing/hashing.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import jwtConfig from './config/jwt.config';
import resetPasswordConfig from './config/reset-password.config';
import { UnauthorizedException } from '@nestjs/common';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResendCodeDto } from './dto/resend-code.dto';
import { ValidateCodeDto } from './dto/validate-code.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import emailCodeConfig from 'src/app/config/email-code.config';
import { EmailService } from 'src/email/email.service';

const createMockUser = (overrides: Partial<User> = {}): User => ({
  uuid: 'uuid-123',
  email: 'email@email.com',
  username: 'email12',
  name: 'userMocked',
  passwordHash: 'hashed-password',
  isActive: true,
  isVerified: false,
  ...overrides,
});

const mockTokens = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
};

describe('AuthService', () => {
  let authService: AuthService;
  let hashingService: HashingService;
  let jwtService: JwtService;
  let usersRepository: Repository<User>;
  let emailService: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: EmailService, useValue: { sendEmail: jest.fn() } },
        {
          provide: HashingService,
          useValue: {
            compare: jest.fn(),
            hash: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: jwtConfig.KEY,
          useValue: {
            secret: 'test-secret',
            audience: 'test-audience',
            issuer: 'test-issuer',
            jwtTtl: 900,
            jwtRefreshTtl: 604800,
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneBy: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: emailCodeConfig.KEY,
          useValue: {
            emailCodeExpiresAt: 900,
            emailCodeResendBlockTime: 30,
          },
        },
        {
          provide: resetPasswordConfig.KEY,
          useValue: {
            secret: 'test-secret',
            audience: 'test-audience',
            issuer: 'test-issuer',
            jwtTtl: 900,
            frontUrl: 'http://localhost:3000',
          },
        },
      ],
    }).compile();

    authService = module.get(AuthService);
    hashingService = module.get(HashingService);
    jwtService = module.get(JwtService);
    usersRepository = module.get(getRepositoryToken(User));
    emailService = module.get(EmailService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('should successfully login with email', async () => {
    const loginDto = { indentifier: 'email@email.com', password: '12345678' };
    const mockUser = createMockUser({ username: 'email', isVerified: true });

    jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(mockUser);
    jest.spyOn(hashingService, 'compare').mockResolvedValue(true);
    jest
      .spyOn(jwtService, 'signAsync')
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');

    const result = await authService.login(loginDto);

    expect(usersRepository.findOneBy).toHaveBeenCalledWith({
      email: loginDto.indentifier,
      isActive: true,
    });
    expect(hashingService.compare).toHaveBeenCalledWith(
      loginDto.password,
      mockUser.passwordHash,
    );
    expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
    expect(result).toEqual(mockTokens);
  });

  it('should successfully login with username', async () => {
    const loginDto = { indentifier: 'email', password: '12345678' };
    const mockUser = createMockUser({ username: 'email', isVerified: true });

    jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(mockUser);
    jest.spyOn(hashingService, 'compare').mockResolvedValue(true);
    jest
      .spyOn(jwtService, 'signAsync')
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');

    const result = await authService.login(loginDto);

    expect(usersRepository.findOneBy).toHaveBeenCalledWith({
      username: loginDto.indentifier,
      isActive: true,
    });
    expect(hashingService.compare).toHaveBeenCalledWith(
      loginDto.password,
      mockUser.passwordHash,
    );
    expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
    expect(result).toEqual(mockTokens);
  });

  it('should return UnauthorizedException when user is not found', async () => {
    const loginDto = { indentifier: 'email', password: '12345678' };

    jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(null);

    await expect(authService.login(loginDto)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should return UnauthorizedException when password is wrong', async () => {
    const loginDto = { indentifier: 'email', password: 'wrong-password' };
    const mockUser = createMockUser({ isVerified: true });

    jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(mockUser);
    jest.spyOn(hashingService, 'compare').mockResolvedValue(false);

    await expect(authService.login(loginDto)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should return UnauthorizedException when refresh token is invalid', async () => {
    const refreshTokenDto: RefreshTokenDto = {
      refreshToken: 'invalid-refresh-token',
    };

    jest
      .spyOn(jwtService, 'verifyAsync')
      .mockRejectedValue(new Error('invalid token'));

    await expect(authService.refreshTokens(refreshTokenDto)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should resend code successfully', async () => {
    const resendCodeDto: ResendCodeDto = { validateEmail: 'email@email.com' };
    const mockUser = createMockUser();

    jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(mockUser);
    jest.spyOn(usersRepository, 'save').mockResolvedValue({
      ...mockUser,
      verificationCode: '123456',
    });

    const result = await authService.resendCode(resendCodeDto);

    expect(usersRepository.findOneBy).toHaveBeenCalledWith({
      email: resendCodeDto.validateEmail,
    });
    expect(usersRepository.save).toHaveBeenCalled();
    expect(result).toEqual({ message: 'Código reenviado com sucesso' });
  });

  it('should return UnauthorizedException when user is blocked to request a new code', async () => {
    const resendCodeDto: ResendCodeDto = { validateEmail: 'email@email.com' };
    const mockUser = createMockUser({
      resendTimeCode: new Date(Date.now() + 60_000),
    });

    jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(mockUser);

    await expect(authService.resendCode(resendCodeDto)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should return new access and refresh tokens', async () => {
    const refreshTokenDto: RefreshTokenDto = {
      refreshToken: 'valid-refresh-token',
    };
    const mockUser = createMockUser({ isVerified: true });

    jest
      .spyOn(jwtService, 'verifyAsync')
      .mockResolvedValue({ sub: mockUser.uuid });
    jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(mockUser);
    jest
      .spyOn(jwtService, 'signAsync')
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');

    const result = await authService.refreshTokens(refreshTokenDto);

    expect(usersRepository.findOneBy).toHaveBeenCalledWith({
      uuid: mockUser.uuid,
      isActive: true,
      isVerified: true,
    });
    expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
    expect(result).toEqual(mockTokens);
  });

  it('should verify user and return tokens with a valid code', async () => {
    const validateCodeDto: ValidateCodeDto = {
      validateEmail: 'email@email.com',
      validateCode: '123456',
    };
    const mockUser = createMockUser({ verificationCode: '123456' });

    jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(mockUser);
    jest
      .spyOn(usersRepository, 'save')
      .mockResolvedValue({ ...mockUser, isVerified: true });
    jest
      .spyOn(jwtService, 'signAsync')
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');

    const result = await authService.validateAccount(validateCodeDto);

    expect(usersRepository.findOneBy).toHaveBeenCalledWith({
      email: validateCodeDto.validateEmail,
    });
    expect(mockUser.isVerified).toBe(true);
    expect(mockUser.verificationCode).toBeNull();
    expect(usersRepository.save).toHaveBeenCalled();
    expect(result).toEqual(mockTokens);
  });

  it('should return UnauthorizedException when code is invalid', async () => {
    const validateCodeDto: ValidateCodeDto = {
      validateEmail: 'email@email.com',
      validateCode: '123456',
    };
    const mockUser = createMockUser({ verificationCode: '676767' });

    jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(mockUser);

    await expect(authService.validateAccount(validateCodeDto)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should return UnauthorizedException when code is expired', async () => {
    const validateCodeDto: ValidateCodeDto = {
      validateEmail: 'email@email.com',
      validateCode: '123456',
    };
    const mockUser = createMockUser({
      verificationCode: '123456',
      validTimeCode: new Date(Date.now() - 60_000),
    });

    jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(mockUser);

    await expect(authService.validateAccount(validateCodeDto)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should return UnauthorizedException when user is not registered', async () => {
    const validateCodeDto: ValidateCodeDto = {
      validateEmail: 'email@email.com',
      validateCode: '123456',
    };

    jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(null);

    await expect(authService.validateAccount(validateCodeDto)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should return UnauthorizedException when account is already verified', async () => {
    const validateCodeDto: ValidateCodeDto = {
      validateEmail: 'email@email.com',
      validateCode: '123456',
    };
    const mockUser = createMockUser({
      verificationCode: '123456',
      isVerified: true,
    });

    jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(mockUser);

    await expect(authService.validateAccount(validateCodeDto)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should send reset password email and return success message', async () => {
    const forgotPasswordDto: ForgotPasswordDto = { email: 'email@email.com' };
    const mockUser = createMockUser({ isVerified: true });

    jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(mockUser);
    jest.spyOn(jwtService, 'signAsync').mockResolvedValue('reset-token');

    const result = await authService.forgotPassword(forgotPasswordDto);

    expect(usersRepository.findOneBy).toHaveBeenCalledWith({
      email: forgotPasswordDto.email,
      isActive: true,
      isVerified: true,
    });
    expect(emailService.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: mockUser.email,
        subject: 'Axion · Redefinição de senha',
      }),
    );
    expect(result).toEqual({
      message: 'E-mail de redefinição de senha enviado com sucesso',
    });
  });

  it('should return UnauthorizedException when email is not registered', async () => {
    const forgotPasswordDto: ForgotPasswordDto = { email: 'email@email.com' };

    jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(null);

    await expect(authService.forgotPassword(forgotPasswordDto)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should reset the password and return success message', async () => {
    const resetPasswordDto: ResetPasswordDto = {
      token: 'valid-reset-token',
      newPassword: 'nova-senha-123',
    };
    const mockUser = createMockUser({ isVerified: true });

    jest
      .spyOn(jwtService, 'verifyAsync')
      .mockResolvedValue({ sub: mockUser.uuid });
    jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(mockUser);
    jest.spyOn(hashingService, 'hash').mockResolvedValue('new-hashed-password');

    const result = await authService.resetPassword(resetPasswordDto);

    expect(jwtService.verifyAsync).toHaveBeenCalledWith(
      resetPasswordDto.token,
      expect.objectContaining({
        secret: 'test-secret',
        audience: 'test-audience',
        issuer: 'test-issuer',
      }),
    );
    expect(usersRepository.findOneBy).toHaveBeenCalledWith({
      uuid: mockUser.uuid,
      isActive: true,
      isVerified: true,
    });
    expect(hashingService.hash).toHaveBeenCalledWith(
      resetPasswordDto.newPassword,
    );
    expect(usersRepository.save).toHaveBeenCalled();
    expect(result).toEqual({
      message: 'Senha redefinida com sucesso. Faça login com sua nova senha.',
    });
  });

  it('should return UnauthorizedException when reset token is invalid or expired', async () => {
    const resetPasswordDto: ResetPasswordDto = {
      token: 'invalid-reset-token',
      newPassword: 'nova-senha-123',
    };

    jest
      .spyOn(jwtService, 'verifyAsync')
      .mockRejectedValue(new Error('invalid token'));

    await expect(authService.resetPassword(resetPasswordDto)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should return UnauthorizedException when user is not found for reset', async () => {
    const resetPasswordDto: ResetPasswordDto = {
      token: 'valid-reset-token',
      newPassword: 'nova-senha-123',
    };

    jest
      .spyOn(jwtService, 'verifyAsync')
      .mockResolvedValue({ sub: 'uuid-123' });
    jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(null);

    await expect(authService.resetPassword(resetPasswordDto)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should change the password and return success message', async () => {
    const changePasswordDto: ChangePasswordDto = {
      password: 'senha-atual',
      newPassword: 'nova-senha-123',
    };
    const mockUser = createMockUser();
    const initialPasswordHash = mockUser.passwordHash;

    jest.spyOn(hashingService, 'compare').mockResolvedValue(true);
    jest.spyOn(hashingService, 'hash').mockResolvedValue('new-hashed-password');

    const result = await authService.changePassword(
      mockUser,
      changePasswordDto,
    );

    expect(hashingService.compare).toHaveBeenCalledWith(
      changePasswordDto.password,
      initialPasswordHash,
    );
    expect(hashingService.hash).toHaveBeenCalledWith(
      changePasswordDto.newPassword,
    );
    expect(usersRepository.save).toHaveBeenCalled();
    expect(result).toEqual({ message: 'Senha alterada com sucesso' });
  });

  it('should return UnauthorizedException when current password is wrong', async () => {
    const changePasswordDto: ChangePasswordDto = {
      password: 'senha-errada',
      newPassword: 'nova-senha-123',
    };
    const mockUser = createMockUser();

    jest.spyOn(hashingService, 'compare').mockResolvedValue(false);

    await expect(
      authService.changePassword(mockUser, changePasswordDto),
    ).rejects.toThrow(UnauthorizedException);
  });
});

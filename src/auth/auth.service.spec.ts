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
import emailCodeConfig from 'src/app/config/email-code.config';
import { ResendCodeDto } from './dto/resend-code.dto';
import { EmailService } from 'src/email/email.service';

const createMockUser = (overrides: Partial<User> = {}): User => ({
  uuid: 'uuid-123',
  email: 'email@email.com',
  username: 'email12',
  name: 'userMocked',
  passwordHash: 'hashed-password',
  isValid: true,
  isVerified: false,
  ...overrides,
});

describe('AuthService', () => {
  let authService: AuthService;
  let hashingService: HashingService;
  let jwtService: JwtService;
  let usersRepository: Repository<User>;

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
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('should successfully login with email', async () => {
    const loginDto = { indentifier: 'email@email.com', password: '12345678' };
    const mockUser = createMockUser({ username: 'email', isVerified: true });
    const mockTokens = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    };

    jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(mockUser);
    jest.spyOn(hashingService, 'compare').mockResolvedValue(true);
    jest
      .spyOn(jwtService, 'signAsync')
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');

    const result = await authService.login(loginDto);

    expect(usersRepository.findOneBy).toHaveBeenCalledWith({
      email: loginDto.indentifier,
      isValid: true,
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
    const mockTokens = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    };

    jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(mockUser);
    jest.spyOn(hashingService, 'compare').mockResolvedValue(true);
    jest
      .spyOn(jwtService, 'signAsync')
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');

    const result = await authService.login(loginDto);

    expect(usersRepository.findOneBy).toHaveBeenCalledWith({
      username: loginDto.indentifier,
      isValid: true,
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
      vericationCode: '123456',
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
});

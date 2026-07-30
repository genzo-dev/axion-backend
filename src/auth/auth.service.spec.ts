import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { HashingService } from './hashing/hashing.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import jwtConfig from './config/jwt.config';
import { UnauthorizedException } from '@nestjs/common';
import { RefreshTokenDto } from './dto/refresh-token.dto';

describe('AuthService', () => {
  let authService: AuthService;
  let hashingService: HashingService;
  let jwtService: JwtService;
  let usersRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
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

  it('should successfuly with email', async () => {
    const loginDto = { indentifier: 'email@email.com', password: '12345678' };
    const mockUser = {
      uuid: 'uuid-123',
      email: 'email@email.com',
      username: 'email',
      name: 'userMocked',
      passwordHash: 'hashed-password',
      isValid: true,
    };
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
    (expect(hashingService.compare).toHaveBeenCalledWith(
      loginDto.password,
      mockUser.passwordHash,
    ),
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2));
    expect(result).toEqual(mockTokens);
  });

  it('should successfuly with username tag', async () => {
    const loginDto = { indentifier: 'email', password: '12345678' };
    const mockUser = {
      uuid: 'uuid-123',
      email: 'email@email.com',
      username: 'email',
      name: 'userMocked',
      passwordHash: 'hashed-password',
      isValid: true,
    };
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
    (expect(hashingService.compare).toHaveBeenCalledWith(
      loginDto.password,
      mockUser.passwordHash,
    ),
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2));
    expect(result).toEqual(mockTokens);
  });

  it('should returned UnauthorizedException when not found user', async () => {
    const loginDto = { indentifier: 'email', password: '12345678' };

    jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(null);

    await expect(authService.login(loginDto)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should returned UnauthorizedException when wrong password', async () => {
    const loginDto = { indentifier: 'email', password: 'wrong-password' };
    const mockUser = {
      uuid: 'uuid-123',
      email: 'email@email.com',
      username: 'email12',
      name: 'userMocked',
      passwordHash: 'hashed-password',
      isValid: true,
    };

    jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(mockUser);
    jest.spyOn(hashingService, 'compare').mockResolvedValue(false);

    await expect(authService.login(loginDto)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should refresh access and refresh tokens', async () => {
    const refreshTokenDto: RefreshTokenDto = { refreshToken: 'refresh-token' };
    const mockTokens = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    };

    jest.spyOn(authService, 'refreshTokens').mockResolvedValue(mockTokens);

    const result = await authService.refreshTokens(refreshTokenDto);

    expect(result).toEqual(mockTokens);
  });

  it('should returned UnauthorizedException when received invalid refresh token', async () => {
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
});

import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HashingService } from './hashing/hashing.service';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshTokenDto } from './dto/refresh-token.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let hashingService: HashingService;
  let jwtService: JwtService;
  let usersRepository: Repository<User>;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
    hashingService = module.get(HashingService);
    jwtService = module.get(JwtService);
    usersRepository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be successfully login', async () => {
    const loginDto = { indentifier: 'email@email.com', password: '12345678' };
    const mockTokens = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    };

    jest.spyOn(authService, 'login').mockResolvedValue(mockTokens);

    const result = await controller.login(loginDto);

    expect(authService.login).toHaveBeenCalledWith(loginDto);
    expect(result).toEqual(mockTokens);
  });

  it('should returnd new access and refresh tokens', async () => {
    const refreshTokenDto: RefreshTokenDto = { refreshToken: 'refresh-token' };
    const mockTokens = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    };

    jest.spyOn(authService, 'refreshTokens').mockResolvedValue(mockTokens);

    const result = await controller.refreshTokens(refreshTokenDto);

    expect(authService.refreshTokens).toHaveBeenCalledWith(refreshTokenDto);
    expect(result).toEqual(mockTokens);
  });
});

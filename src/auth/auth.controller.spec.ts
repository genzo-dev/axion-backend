import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthTokenGuard } from './guards/auth-token.guard';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockAuthService = {
    login: jest.fn(),
    refreshTokens: jest.fn(),
    validateAccount: jest.fn(),
    resendCode: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    changePassword: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    })
      .overrideGuard(AuthTokenGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(
      AuthService,
    ) as jest.Mocked<AuthService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call login and return tokens', async () => {
    const loginDto = { indentifier: 'email@email.com', password: '12345678' };
    const mockTokens = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    };

    authService.login.mockResolvedValue(mockTokens);

    const result = await controller.login(loginDto);

    expect(authService.login).toHaveBeenCalledWith(loginDto);
    expect(result).toEqual(mockTokens);
  });

  it('should call refreshTokens and return new tokens', async () => {
    const refreshTokenDto: RefreshTokenDto = { refreshToken: 'refresh-token' };
    const mockTokens = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    };

    authService.refreshTokens.mockResolvedValue(mockTokens);

    const result = await controller.refreshTokens(refreshTokenDto);

    expect(authService.refreshTokens).toHaveBeenCalledWith(refreshTokenDto);
    expect(result).toEqual(mockTokens);
  });
});

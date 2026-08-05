import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthTokenGuard } from './guards/auth-token.guard';
import type { Request } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockTokens = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
  };

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

    authService.login.mockResolvedValue(mockTokens);

    const result = await controller.login(loginDto);

    expect(authService.login).toHaveBeenCalledWith(loginDto);
    expect(result).toEqual(mockTokens);
  });

  it('should call refreshTokens and return new tokens', async () => {
    const refreshTokenDto: RefreshTokenDto = { refreshToken: 'refresh-token' };

    authService.refreshTokens.mockResolvedValue(mockTokens);

    const result = await controller.refreshTokens(refreshTokenDto);

    expect(authService.refreshTokens).toHaveBeenCalledWith(refreshTokenDto);
    expect(result).toEqual(mockTokens);
  });

  it('should call validateAccount and return tokens', async () => {
    const validateCodeDto = {
      validateEmail: 'email@email.com',
      validateCode: '123456',
    };

    authService.validateAccount.mockResolvedValue(mockTokens);

    const result = await controller.validateAccount(validateCodeDto);

    expect(authService.validateAccount).toHaveBeenCalledWith(validateCodeDto);
    expect(result).toEqual(mockTokens);
  });

  it('should call resendCode and return success message', async () => {
    const resendCodeDto = { validateEmail: 'email@email.com' };
    const mockResult = { message: 'Código reenviado com sucesso' };

    authService.resendCode.mockResolvedValue(mockResult);

    const result = await controller.resendCode(resendCodeDto);

    expect(authService.resendCode).toHaveBeenCalledWith(resendCodeDto);
    expect(result).toEqual(mockResult);
  });

  it('should call forgotPassword and return success message', async () => {
    const forgotPasswordDto = { email: 'email@email.com' };
    const mockResult = {
      message: 'E-mail de redefinição de senha enviado com sucesso',
    };

    authService.forgotPassword.mockResolvedValue(mockResult);

    const result = await controller.forgotPassword(forgotPasswordDto);

    expect(authService.forgotPassword).toHaveBeenCalledWith(forgotPasswordDto);
    expect(result).toEqual(mockResult);
  });

  it('should call resetPassword and return success message', async () => {
    const resetPasswordDto = {
      token: 'valid-reset-token',
      newPassword: 'nova-senha-123',
    };
    const mockResult = {
      message: 'Senha redefinida com sucesso. Faça login com sua nova senha.',
    };

    authService.resetPassword.mockResolvedValue(mockResult);

    const result = await controller.resetPassword(resetPasswordDto);

    expect(authService.resetPassword).toHaveBeenCalledWith(resetPasswordDto);
    expect(result).toEqual(mockResult);
  });

  it('should call changePassword with the authenticated user', async () => {
    const changePasswordDto = {
      password: 'senha-atual',
      newPassword: 'nova-senha-123',
    };
    const mockReq = { user: { uuid: 'uuid-123' } } as unknown as Request;
    const mockResult = { message: 'Senha alterada com sucesso' };

    authService.changePassword.mockResolvedValue(mockResult);

    const result = await controller.changePassword(changePasswordDto, mockReq);

    expect(authService.changePassword).toHaveBeenCalledWith(
      mockReq.user,
      changePasswordDto,
    );
    expect(result).toEqual(mockResult);
  });
});

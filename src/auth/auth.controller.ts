import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import {
  ApiCreatedResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ValidateCodeDto } from './dto/validate-code.dto';
import { ResendCodeDto } from './dto/resend-code.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Login do usuário na plataforma.' })
  @ApiCreatedResponse({ description: 'Login realizado com sucesso.' })
  @ApiUnauthorizedResponse({
    description: 'E-mail, username ou senha inválidos.',
  })
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiOperation({
    summary:
      'Usuário autenticado deve fazer refresh automático de seus tokens.',
  })
  @ApiCreatedResponse({
    description: 'access token e refresh token gerados com sucesso.',
  })
  @ApiUnauthorizedResponse({
    description: 'Usuário não autorizado.',
  })
  @Post('refresh')
  refreshTokens(@Body() refreshTokensDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokensDto);
  }

  @ApiOperation({
    summary:
      'Usuário validado e login realizado a partir de access e refresh tokens.',
  })
  @ApiCreatedResponse({
    description: 'Conta verificada e access e refresh tokens criados.',
  })
  @ApiUnauthorizedResponse({
    description: 'Usuário não autorizado | Código inválido | Código expirado',
  })
  @Post('verify')
  validateAccount(@Body() validateCodeDto: ValidateCodeDto) {
    return this.authService.validateAccount(validateCodeDto);
  }

  @ApiOperation({
    summary: 'Usuário recebe um novo código para verificação do e-mail.',
  })
  @ApiCreatedResponse({
    description: 'Código reenviado e estabelecido um novo cooldown de 30s.',
  })
  @ApiUnauthorizedResponse({
    description: 'Usuário não autorizado | Código inválido | Código expirado',
  })
  @Post('resend-code')
  resendCode(@Body() resendCodeDto: ResendCodeDto) {
    return this.authService.resendCode(resendCodeDto);
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example:
      'Token JWT enviado no link de redefinição de senha - eyJhbGciOi...',
  })
  @IsNotEmpty()
  token!: string;

  @ApiProperty({
    example: '12345678',
  })
  @IsNotEmpty()
  @MinLength(8, {
    message: 'A nova senha deve ter no mínimo 8 caracteres',
  })
  newPassword!: string;
}

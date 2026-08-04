import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    example: '12345678',
    description: 'Insira a senha sua atual',
  })
  @IsString()
  password!: string;

  @ApiProperty({
    example: '87654321',
    description: 'Insira sua nova senha',
  })
  @IsString()
  @MinLength(8, {
    message: 'A nova senha deve ter no mínimo 8 caracteres',
  })
  newPassword!: string;
}

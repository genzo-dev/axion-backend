import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'email@email.com',
    description: 'E-mail cadastrado na plataforma',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ValidateCodeDto {
  @ApiProperty({
    example: 'email@email.com',
  })
  @IsEmail()
  @IsNotEmpty()
  validateEmail!: string;

  @ApiProperty({
    example: '123456',
  })
  @IsNotEmpty()
  validateCode!: string;
}

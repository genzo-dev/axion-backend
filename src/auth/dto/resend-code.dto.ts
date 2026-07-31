import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendCodeDto {
  @ApiProperty({
    example: 'email@email.com',
  })
  @IsEmail()
  @IsNotEmpty()
  validateEmail!: string;
}

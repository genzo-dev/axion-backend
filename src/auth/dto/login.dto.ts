import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'genzo_dev',
    description:
      'Aceita o email ou o username do usuário (Ex.: @genzo_dev OU gabrielenzodev@gmail.com)',
  })
  @IsString()
  indentifier!: string;

  @ApiProperty({
    example: '12345678',
    description: 'Insira a senha do usuário em questão',
  })
  @IsString()
  password!: string;
}

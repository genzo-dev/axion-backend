import { ApiProperty } from '@nestjs/swagger';

export class ResponseUserDto {
  @ApiProperty({
    description: 'Identificador público do usuário',
  })
  uuid!: string;

  @ApiProperty({
    example: 'email@email.com',
    description: 'Retorna o e-mail do usuário',
  })
  email!: string;

  @ApiProperty({
    example: 'genzo_dev',
    description: 'Retorna o username do usuário',
  })
  username!: string;

  @ApiProperty({
    example: 'Gabriel Enzo',
    description: 'Retorna o nome do usuário',
  })
  name!: string;

  @ApiProperty({
    example: 'Gabriel Enzo',
    description: 'Retorna a descrição do usuário',
  })
  description!: string;

  @ApiProperty({
    example: 'Gabriel Enzo',
    description: 'Retorna a data de criação da conta do usuário',
  })
  createdAt!: string;
}

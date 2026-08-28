import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'email@email.com',
    description:
      'Usuário deve informar seu e-mail no momento da criação de sua conta.',
  })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  @IsEmail({}, { message: 'Email inválido' })
  email!: string;

  @ApiProperty({
    example: 'genzo_dev',
    description:
      'Segue um formato de tag de usuário, transformando espaços em "_" de forma automática (genzo dev -> genzo_dev) e será utilizado como tag do usuário no frontend (Ex.: @genzo_dev)',
  })
  @IsOptional()
  @IsString({ message: 'Username deve ser um texto' })
  username?: string;

  @ApiProperty({
    example: '12345678',
    description:
      'Usuário informa a senha durante a criação da conta e ela é salva hasheada no banco.',
  })
  @IsString({ message: 'Senha deve ser um texto' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  password!: string;

  @ApiProperty({
    example: 'Gabriel Enzo',
    description:
      'Usuário deve informar seu nome no momento da criação de sua conta.',
  })
  @IsString({ message: 'Nome deve ser um texto' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
  @MaxLength(150, { message: 'Nome deve ter no máximo 150 caracteres' })
  name!: string;

  // TODO: Adicionar após a criação de um usuário admin
  // @IsEnum(RoutePolicies, { each: true })
  // routePolicies: RoutePolicies[];
}

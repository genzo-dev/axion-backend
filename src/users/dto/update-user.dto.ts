import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    example: 'genzo_dev',
    description:
      'Segue um formato de tag de usuário, transformando espaços em "_" de forma automática (genzo dev -> genzo_dev) e será utilizado como tag do usuário no frontend (Ex.: @genzo_dev)',
  })
  @IsOptional()
  @IsString({ message: 'Username deve ser um texto' })
  username?: string;

  @ApiProperty({
    example: 'Gabriel Enzo',
    description:
      'Usuário deve informar seu nome no momento da criação de sua conta.',
  })
  @IsString({ message: 'Nome deve ser um texto' })
  @IsOptional()
  @MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
  @MaxLength(150, { message: 'Nome deve ter no máximo 150 caracteres' })
  name?: string;

  @ApiProperty({
    example: 'Desenvolvedor Fullstack voltado para desenvolvimento web',
    description:
      'Usuário deve informar seu nome no momento da criação de sua conta.',
  })
  @IsString({ message: 'Nome deve ser um texto' })
  @IsOptional()
  @MaxLength(500, { message: 'Nome deve ter no máximo 150 caracteres' })
  description?: string;

  // @IsOptional()
  // profileImage?: string;

  // TODO: Adicionar após a criação de um usuário admin
  // @IsEnum(RoutePolicies, { each: true })
  // routePolicies: RoutePolicies[];
}

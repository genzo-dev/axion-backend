import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Email é obrigatória' })
  @IsEmail({}, { message: 'Email inválido' })
  email!: string;

  @IsNotEmpty({ message: 'Username inválido' })
  @IsString({ message: 'Username deve ser um texto' })
  username!: string;

  @IsString({ message: 'Senha deve ser um texto' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(5, { message: 'Senha deve ter no mínimo 5 caracteres' })
  password!: string;

  @IsString({ message: 'Nome deve ser um texto' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
  @MaxLength(150, { message: 'Nome deve ter no máximo 150 caracteres' })
  name!: string;

  // TODO: Adicionar após a criação de um usuário admin
  // @IsEnum(RoutePolicies, { each: true })
  // routePolicies: RoutePolicies[];
}

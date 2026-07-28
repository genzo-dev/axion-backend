import { IsEmail } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// TODO: Adicionar relacionamentos com outras tabelas (Ex: Tabela de Trilhas), após a criação delas

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  uuid!: string;

  @Column({ unique: true })
  @IsEmail()
  email!: string;

  // Ex: @genzo-dev - TODO: Remover comentário após instalação e configuração do Swagger
  @Column({ unique: true, length: 50 })
  username!: string;

  @Column({ length: 255 })
  passwordHash!: string;

  @Column({ length: 150 })
  name!: string;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}

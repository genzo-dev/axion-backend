import { IsEmail } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

// TODO: Adicionar relacionamentos com outras tabelas (Ex: Tabela de Trilhas), após a criação delas

@Entity()
@Unique('UQ_user_email', ['email'])
@Unique('UQ_user_username', ['username'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  uuid!: string;

  @Column()
  @IsEmail()
  email!: string;

  @Column({ length: 50 })
  username!: string;

  @Column({ length: 255 })
  passwordHash!: string;

  @Column({ length: 150 })
  name!: string;

  @Column({ type: 'varchar', nullable: true })
  verificationCode?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  validTimeCode?: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  resendTimeCode?: Date | null;

  @Column({ default: false })
  isVerified!: boolean;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'varchar', nullable: true })
  refreshTokenJti!: string | null;

  @Column({ type: 'varchar', nullable: true })
  resetPasswordJti!: string | null;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}

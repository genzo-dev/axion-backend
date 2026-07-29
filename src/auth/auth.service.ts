import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { HashingService } from './hashing/hashing.service';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly hashingService: HashingService,
  ) {}

  async login(loginDto: LoginDto) {
    let passwordIsValid = false;

    const isEmail: boolean = loginDto.indentifier.includes('@');

    const identifierObj = isEmail
      ? { email: loginDto.indentifier, isValid: true }
      : { username: loginDto.indentifier, isValid: true };

    const user = await this.usersRepository.findOneBy(identifierObj);

    if (user) {
      passwordIsValid = await this.hashingService.compare(
        loginDto.password,
        user.passwordHash,
      );
    }

    if (!user || !passwordIsValid) {
      throw new UnauthorizedException('E-mail, username ou senha inválidos');
    }

    console.log('LOGIN REALIZADO');

    return user;
  }
}

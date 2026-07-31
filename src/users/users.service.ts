import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { HashingService } from 'src/auth/hashing/hashing.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { createUsername } from 'src/common/utils/create-username';
import { randomizeUsername } from 'src/common/utils/randomize-username';
import { generateValidationUserCode } from 'src/common/utils/generate-validation-user-code';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingService,
  ) {}

  notFoundPerson<T>(
    entity: T | null | undefined,
    errorMessage: string,
  ): asserts entity is T {
    if (!entity) {
      throw new NotFoundException(errorMessage);
    }
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const passwordHash = await this.hashingService.hash(
        createUserDto.password,
      );

      const normalizeUsername = createUserDto.username
        ? createUsername(createUserDto.username)
        : randomizeUsername(createUserDto.name);

      const userData = {
        name: createUserDto.name,
        passwordHash,
        email: createUserDto.email,
        username: normalizeUsername,
      };

      const newUser = this.userRepository.create(userData);
      await this.userRepository.save(newUser);

      const newUserValidateCode = generateValidationUserCode();
      const newValidTimeCode = new Date(Date.now() + 15 * 60 * 1000);
      const newResendTimeCode = new Date(Date.now() + 30 * 1000);

      newUser.vericationCode = newUserValidateCode;
      newUser.validTimeCode = newValidTimeCode;
      newUser.resendTimeCode = newResendTimeCode;

      console.log('CÓDIGO DE VALIDAÇÃO DA CONTA ', newUserValidateCode);

      const savedUser = await this.userRepository.save(newUser);

      return savedUser;
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as any).driverError.code === '23505'
      ) {
        const driverError = (
          error as QueryFailedError & {
            driverError: { code: string; constraint?: string };
          }
        ).driverError;

        const constraint = driverError.constraint;

        if (constraint === 'UQ_user_email') {
          throw new ConflictException({
            field: 'email',
            message: 'Já existe uma conta com este e-mail',
          });
        }

        if (constraint === 'UQ_user_username') {
          throw new ConflictException({
            field: 'username',
            message: 'Este nome de usuário não está disponível',
          });
        }

        throw new ConflictException({
          field: 'general',
          message: 'Dados duplicados',
        });
      }

      throw error;
    }
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}

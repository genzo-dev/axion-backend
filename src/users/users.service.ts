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

      const userData = {
        name: createUserDto.name,
        passwordHash,
        email: createUserDto.email,
        username: createUserDto.username,
      };

      const newUser = this.userRepository.create(userData);

      await this.userRepository.save(newUser);

      return newUser;
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as any).driverError.code === '23505'
      ) {
        throw new ConflictException('E-mail já está cadastrado');
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

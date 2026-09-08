import {
  ConflictException,
  Inject,
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
import emailCodeConfig from 'src/app/config/email-code.config';
import type { ConfigType } from '@nestjs/config';
import { EmailService } from 'src/email/email.service';
import { SendEmailDto } from 'src/email/dto/send-email.dto';
import { buildValidationCodeEmail } from 'src/email/templates/validation-code.template';
import { UploadFileService } from 'src/upload-file/upload-file.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingService,
    @Inject(emailCodeConfig.KEY)
    private readonly emailCodeConfiguration: ConfigType<typeof emailCodeConfig>,
    private readonly emailService: EmailService,
    private readonly uploadFileService: UploadFileService,
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

      const newUserValidateCode =
        process.env.NODE_ENV === 'test'
          ? '123456'
          : generateValidationUserCode();
      const newValidTimeCode = (newUser.resendTimeCode = new Date(
        Date.now() + this.emailCodeConfiguration.emailCodeExpiresAt * 1000,
      ));
      const newResendTimeCode = (newUser.validTimeCode = new Date(
        Date.now() +
          this.emailCodeConfiguration.emailCodeResendBlockTime * 1000,
      ));

      newUser.verificationCode =
        await this.hashingService.hash(newUserValidateCode);
      newUser.validTimeCode = newValidTimeCode;
      newUser.resendTimeCode = newResendTimeCode;

      if (
        process.env.NODE_ENV === 'development' ||
        process.env.NODE_ENV === 'test'
      ) {
        console.log('CÓDIGO DE VALIDAÇÃO DA CONTA ', newUserValidateCode);
      }

      const savedUser = await this.userRepository.save(newUser);

      if (process.env.NODE_ENV !== 'test') {
        const { html, attachments } =
          buildValidationCodeEmail(newUserValidateCode);
        const newSendEmailDto: SendEmailDto = {
          to: savedUser.email,
          subject: 'Axion · Confirme seu e-mail',
          html: html,
          attachments,
        };

        await this.emailService.sendEmail(newSendEmailDto);
      }

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

  async updateMe(user: User, dto: UpdateUserDto, file?: Express.Multer.File) {
    try {
      let profileImageKey: string | undefined;

      if (file && file.size > 0) {
        profileImageKey = await this.uploadFileService.uploadProfileImage({
          userUuid: user.uuid,
          file,
        });
      }

      const updateUser: Partial<User> = {
        ...dto,
        ...(profileImageKey && { profileImageKey }),
      };

      const result = await this.userRepository.update(
        { uuid: user.uuid },
        updateUser,
      );

      return result;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException(
          'Este nome de usuário já está sendo utilizado',
        );
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

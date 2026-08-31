import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { HashingService } from 'src/auth/hashing/hashing.service';
import { ConflictException, ExecutionContext } from '@nestjs/common';
import emailCodeConfig from 'src/app/config/email-code.config';
import jwtConfig from 'src/auth/config/jwt.config';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;
  let hashingService: HashingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: HashingService,
          useValue: {
            hash: jest.fn(),
          },
        },
        {
          provide: emailCodeConfig.KEY,
          useValue: {
            emailCodeExpiresAt: 900,
            emailCodeResendBlockTime: 30,
          },
        },
        {
          provide: jwtConfig.KEY,
          useValue: {
            secret: process.env.JWT_SECRET || 'segredo',
            audience: process.env.JWT_TOKEN_AUDIENCE,
            issuer: process.env.JWT_TOKEN_ISSUER,
            jwtTtl: Number(process.env.JWT_TTL ?? '900'),
            jwtRefreshTtl: Number(process.env.JWT_REFRESH_TTL ?? '604800'),
          },
        },
      ],
    })
      .overrideGuard(AuthTokenGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
    hashingService = module.get(HashingService);
  });

  const mockUser = {
    uuid: 'user-123',
    email: ' user@email.com',
    username: 'user_username',
    name: 'Axion',
    description: 'Sou um usuário de teste',
    createdAt: new Date(),
  };

  const mockAuthTokenGuard = {
    canAcitvate: (context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.user = mockUser;
    },
  };

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create user', async () => {
    const createUserDto = {
      email: 'email@email.com',
      username: 'genzo-dev',
      password: '12345678',
      name: 'Gabriel Enzo',
    };

    const createUserResponse = {
      email: 'email@email.com',
      username: 'genzo-dev',
      passwordHash: await hashingService.hash(createUserDto.password),
      name: 'Gabriel Enzo',
      refreshTokenJti: '',
      resetPasswordJti: '',
    };

    const expectedResult = {
      uuid: '1',
      ...createUserResponse,
      createAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      isVerified: true,
    };

    usersService.create.mockResolvedValue(expectedResult);

    const result = await controller.create(createUserDto);

    expect(usersService.create).toHaveBeenCalledWith(createUserDto);
    expect(result).toEqual(expectedResult);
  });

  it('should throw ConflictException when email or username already exists', async () => {
    const dto = {
      email: 'email@email.com',
      username: 'genzo-dev',
      password: '12345678',
      name: 'Gabriel Enzo',
    };
    usersService.create.mockRejectedValue(
      new ConflictException('E-mail ou username (@) já cadastrado'),
    );

    await expect(controller.create(dto)).rejects.toThrow(ConflictException);
    expect(usersService.create).toHaveBeenCalledWith(dto);
  });

  it('should return authenticated user', async () => {
    const req = {
      user: mockUser,
    };

    const result = controller.getMe(req);

    expect(result).toEqual(mockUser);
  });
});

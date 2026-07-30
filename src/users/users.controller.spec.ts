import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { HashingService } from 'src/auth/hashing/hashing.service';
import { ConflictException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;
  let hashingService: HashingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
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
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
    hashingService = module.get(HashingService);
  });

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
    };

    const expectedResult = {
      uuid: '1',
      ...createUserResponse,
      createAt: new Date(),
      updatedAt: new Date(),
      isValid: true,
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
});

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import { ResponseUserDto } from './dto/response-user.dto';
import { User } from './entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Usuário poderá criar sua conta.' })
  @ApiCreatedResponse({ description: 'Conta/Usuário criado com sucesso.' })
  @ApiConflictResponse({ description: 'E-mail ou username (@) já cadastrado.' })
  @Throttle({})
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Encontra o usuário autenticado.' })
  @ApiOkResponse({
    description: 'Informações do usuário autenticado retornadas com sucesso',
  })
  @ApiUnauthorizedResponse({
    description: 'Usuário não autorizado | Usuário não logado',
  })
  @UseGuards(AuthTokenGuard)
  @SkipThrottle({ short: true, medium: true, long: true })
  @Get('me')
  getMe(@Req() req): ResponseUserDto {
    const user = req.user;

    return {
      uuid: user.uuid,
      email: user.email,
      username: user.username,
      name: user.name,
      profileImageKey: user.profileImageKey,
      description: user.description,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      allOf: [
        { $ref: getSchemaPath(UpdateUserDto) },
        {
          type: 'object',
          properties: {
            profileImage: {
              type: 'string',
              format: 'binary',
            },
          },
        },
      ],
    },
  })
  @ApiOperation({ summary: 'Atualiza o usuário autenticado.' })
  @ApiOkResponse({
    description: 'Informações do usuário autenticado atualizadas com sucesso',
  })
  @ApiConflictResponse({
    description: 'Nome de usuário (username) deve ser único',
  })
  @ApiUnauthorizedResponse({
    description: 'Usuário não autorizado | Usuário não logado',
  })
  @UseGuards(AuthTokenGuard)
  @UseInterceptors(FileInterceptor('profileImage'))
  @SkipThrottle({ short: true, medium: true, long: true })
  @Patch('me')
  updateMe(
    @Req() req,
    @Body() dto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.usersService.updateMe(req.user, dto, file);
  }

  @ApiOperation({ summary: 'Encontra todos os usuários.' })
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @ApiOperation({ summary: 'Encontra um usuário.' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  // TODO: Operação para ADMINs. Usuários comuns terão somente /me
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  // TODO: Operação para ADMINs. Usuários comuns terão somente /me
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}

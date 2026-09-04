import {
  Controller,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UseGuards,
  Req,
  UploadedFile,
} from '@nestjs/common';
import { UploadFileService } from './upload-file.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';

@Controller('upload-file')
export class UploadFileController {
  constructor(private readonly uploadFileService: UploadFileService) {}

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Encontra o usuário autenticado.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Informações do usuário autenticado retornadas com sucesso',
  })
  @ApiUnauthorizedResponse({
    description: 'Usuário não autorizado | Usuário não logado',
  })
  @Patch()
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(AuthTokenGuard)
  uploadProfileImage(@Req() req, @UploadedFile() file: Express.Multer.File) {
    return this.uploadFileService.uploadProfileImage({
      userUuid: req.user.uuid,
      file,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.uploadFileService.remove(+id);
  }
}

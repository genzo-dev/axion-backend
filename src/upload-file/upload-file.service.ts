import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UploadFileDto } from './dto/upload-file.dto';
import path from 'path';
import sharp from 'sharp';
import * as fs from 'fs/promises';

@Injectable()
export class UploadFileService {
  async uploadProfileImage(uploadFile: UploadFileDto) {
    if (!uploadFile.userUuid) {
      throw new UnauthorizedException(
        'Usuário não autorizado | Usuário não logado',
      );
    }

    const buffer = await sharp(uploadFile.file.buffer)
      .resize(360, 360, { fit: 'cover' })
      .webp({ quality: 80 })
      .toBuffer();

    if (uploadFile.file.size < 5 * 1024) {
      throw new BadRequestException('Arquivo muito pequeno');
    }

    if (uploadFile.file.size > 200 * 1024) {
      throw new BadRequestException('Arquivo muito grande');
    }

    const fileName = `${uploadFile.userUuid}.webp`;
    const fileFullPath = path.resolve(process.cwd(), 'pictures', fileName);

    //TODO: ANTES DO MVP - Alterar para um storage externo ao invés de salvar em uma pasta no backend
    await fs.mkdir(path.dirname(fileFullPath), { recursive: true });
    await fs.writeFile(fileFullPath, buffer);

    return fileName;
  }

  remove(id: number) {
    return `This action removes a #${id} uploadFile`;
  }
}

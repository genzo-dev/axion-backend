import { IsNotEmpty, IsString } from 'class-validator';

export class UploadFileDto {
  @IsNotEmpty()
  @IsString()
  userUuid!: string;

  @IsNotEmpty()
  file!: Express.Multer.File;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

// TODO: Implementar variável from para usar o domínio do Axion via .env

export class SendEmailDto {
  @ApiProperty({
    example: 'email@email.com',
  })
  @IsEmail()
  @IsNotEmpty()
  to!: string;

  @ApiProperty({
    example: 'Assunto do e-mail',
  })
  @IsEmail()
  @IsNotEmpty()
  subject!: string;

  @ApiProperty({
    example: '<div>Conteúdo do e-mail em HTML</div>:',
  })
  @IsEmail()
  @IsNotEmpty()
  html!: string;

  attachments?: Array<{
    content: string;
    filename: string;
    contentType?: string;
    contentId?: string;
  }>;
}

// to: string, subject: string, html: string

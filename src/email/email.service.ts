import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { SendEmailDto } from './dto/send-email.dto';

// TODO: Implementar o SMTP via nodemailer para envio com o domínio do Axion

@Injectable()
export class EmailService {
  async sendEmail(sendEmailDto: SendEmailDto) {
    const resend = new Resend(process.env.EMAIL_RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: 'Axion <no-reply@resend.dev>',
      to: [sendEmailDto.to],
      subject: sendEmailDto.subject,
      html: sendEmailDto.html,
      attachments: sendEmailDto.attachments,
    });

    if (error) {
      return console.error({ error });
    }

    console.log({ data });
  }
}

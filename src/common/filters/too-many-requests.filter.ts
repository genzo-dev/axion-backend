import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class TooManyRequestsFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const httpStatusCode = exception.getStatus();

    if (httpStatusCode === HttpStatus.TOO_MANY_REQUESTS) {
      response.status(httpStatusCode).json({
        statusCode: httpStatusCode,
        timestamp: new Date().toISOString(),
        path: request.url,
        message:
          'Você atingiu o limite de requisições. Aguarde alguns segundos para tentar novamente.',
      });
    }
  }
}

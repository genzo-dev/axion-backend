import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { AbstractHttpAdapter } from '@nestjs/core';
import { Request, Response } from 'express';

@Catch(HttpException)
export class TooManyRequestsFilter extends BaseExceptionFilter {
  constructor(httpAdapter: AbstractHttpAdapter) {
    super(httpAdapter);
  }

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();

    if (status === HttpStatus.TOO_MANY_REQUESTS) {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message:
          'Você atingiu o limite de requisições. Aguarde alguns segundos para tentar novamente.',
      });

      return;
    }

    super.catch(exception, host);
  }
}

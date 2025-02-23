import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class RpcExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    console.trace({ exception, type: typeof exception });
    if (exception instanceof Object && 'getResponse' in exception) {
      response.status(exception.getStatus()).json(exception.getResponse());
      return;
    }

    const statusCode = exception?.statusCode || 400;
    response.status(statusCode).json({
      statusCode: exception.statusCode || statusCode,
      status: exception.status || 'error',
      message: exception.message || 'Bad request',
    });
  }
}

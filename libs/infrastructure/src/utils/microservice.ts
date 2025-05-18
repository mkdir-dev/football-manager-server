import {
  BadGatewayException,
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable, throwError } from 'rxjs';
// TODO: импортировать тип
// import { UserAccount } from '@services/gateway/user';

export function messageData<T>(
  // TODO: указать тип
  account: any,
  payload: T
): {
  // TODO: указать тип
  account: any;
  data: T;
} {
  return {
    account,
    data: payload,
  };
}

export function simpleMessageData<T = any>(
  accountId: number,
  payload: T
): {
  accountId: number;
  data: T;
} {
  return {
    accountId,
    data: payload,
  };
}

export interface MessagePayload<T = any> {
  // TODO: указать тип
  account: any;
  data: T;
}

export interface SimpleMessagePayload<T = any> {
  accountId: number;
  data: T;
}

@Injectable()
export class MicroserviceExceptions implements NestInterceptor {
  constructor() {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError(err => {
        console.error('Error:', err);
        if (!err.message) return throwError(() => new BadGatewayException());
        return throwError(() => new BadRequestException(err.message));
      })
    );
  }
}

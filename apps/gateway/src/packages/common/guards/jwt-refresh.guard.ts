import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthenticationExceptions } from '@infrastructure/exceptions/auth.exceptions';

import { JwtTokenType } from 'packages/authentication/authentication.types';
import { JwtPayload } from 'packages/authentication/authentication.types';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
  handleRequest<TUser = any>(
    err: any,
    user: TUser,
    info: any,
    context: ExecutionContext,
    status?: any
  ): TUser | JwtPayload {
    if (err || !user) {
      console.error('JWT Refresh Guard error: ', err);
      throw (
        err ||
        new UnauthorizedException(AuthenticationExceptions.AuthorizationHeaderIsMissingOrInvalid)
      );
    }

    // @ts-expect-error: check if user is of type JwtPayload
    if (user.type !== JwtTokenType.refresh) {
      console.error('JWT Refresh Guard error: ', err);
      throw new UnauthorizedException(
        AuthenticationExceptions.AuthorizationHeaderIsMissingOrInvalid
      );
    }

    return user as JwtPayload;
  }
}

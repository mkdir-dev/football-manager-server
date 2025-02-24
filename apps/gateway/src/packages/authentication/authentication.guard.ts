import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

import { AuthenticationService } from 'authentication/authentication.service';
import { AuthenticationExceptions } from 'authentication/authentication.exceptions';
import { UserService } from 'user/user.service';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private authenticationService: AuthenticationService,
    private userService: UserService
  ) {}

  async canActivate(ctx: ExecutionContext) {
    if (ctx.getType() === 'rpc') return true;

    const request = ctx.switchToHttp().getRequest<Request>();
    const initialDataRaw = request.headers['authorization'];
    if (typeof initialDataRaw !== 'string') {
      throw new UnauthorizedException(
        AuthenticationExceptions.AuthorizationHeaderIsMissingOrInvalid
      );
    }

    const initialData = await this.authenticationService.authenticateByInitialData(initialDataRaw);
    const user = await this.userService.getOrCreateUser(initialDataRaw);

    if (!!user?.accountId) {
      const { authDate } = initialData.metadata;
      const lastActiveAt = new Date(+authDate * 1000);
      await this.userService.setLastActiveAt(user.accountId, lastActiveAt);
    }

    return true;
  }
}

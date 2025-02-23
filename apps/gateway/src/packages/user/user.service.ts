import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

// import { UserMicroserviceName } from './user.injects';

@Injectable()
export class UserService {
  constructor() {} // @Inject(UserMicroserviceName) private userClient: ClientProxy

  async getUser(authorization: string) {
    // если нет авторизации, то возвращаем exception с ошибкой авторизации

    /*
    console.log('service getUser', authorization);
    const getUser$ = this.userClient.send<any>('user.get-or-create.user.command', {
      authorization,
    });

    return await firstValueFrom(getUser$);
    */
    return { authorization };
  }
}

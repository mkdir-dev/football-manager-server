import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

// import { UserRepository } from './user.repository';
// import { CreateUserAccount } from './user.types';
// import { UserExceptions } from './user.exceptions';

@Injectable()
export class UserService {
  constructor() {} // private userRepository: UserRepository

  async getOrCreateUser(authorization: string) {
    // if (!authorization) {
    //   throw new RpcException(UserExceptions.InvalidTelegramUserData);
    // }

    const params = new URLSearchParams(authorization);
    const userData = params.get('user');
    const hash = params.get('hash');
    const auth_date = params.get('auth_date');

    // : CreateUserAccount
    const telegramUserData = JSON.parse(decodeURIComponent(userData ?? ''));

    /*
    if (!telegramUserData) {
      throw new RpcException(UserExceptions.InvalidTelegramUserData);
    }

    const user = await this.userRepository.getUserByTelegramAccountId(telegramUserData.id);

    if (!user) {
      return await this.userRepository.createUser(telegramUserData);
    }
    */

    return telegramUserData; // user;

    /*
    return {
      id: telegramUserData.id,
      username: telegramUserData.username,
      firstName: telegramUserData.first_name,
      lastName: telegramUserData.last_name,
      avatar: telegramUserData.photo_url ?? '',
      language: telegramUserData.language_code ?? 'en',
      isAllowsWrite: telegramUserData.allows_write_to_pm ?? false,
      hash,
      authDate: auth_date ? Number(auth_date) : null,
    };
    */
  }
}

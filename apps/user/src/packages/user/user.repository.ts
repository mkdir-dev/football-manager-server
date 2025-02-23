import { Injectable } from '@nestjs/common';

import { PrismaRepository } from '@infrastructure/utils';

import { CreateUserAccount } from 'user/user.types';

@Injectable()
export class UserRepository extends PrismaRepository<'user'> {
  constructor() {
    super('user');
  }

  async getUserByTelegramAccountId(telegramId: number) {
    const telegramAccount = await this.context.telegramAccount.findUnique({
      where: { telegramId },
      include: {
        user: { include: { telegramAccount: true } },
      },
    });

    return telegramAccount?.user;
  }

  async createUser(createUserAccount: CreateUserAccount) {
    const displayName =
      createUserAccount.username ||
      createUserAccount.first_name ||
      createUserAccount.last_name ||
      'Unknown';

    return await this.context.userAccount.create({
      data: {
        displayName,
        avatarUrl: createUserAccount.photo_url ?? '',
        telegramAccount: {
          create: {
            telegramId: createUserAccount.id,
            username: createUserAccount.username,
            firstName: createUserAccount.first_name ?? '',
            lastName: createUserAccount.last_name ?? '',
            avatarUrl: createUserAccount.photo_url ?? '',
            language: createUserAccount.language_code ?? 'en',
            isAllowsWrite: createUserAccount.allows_write_to_pm ?? false,
          },
        },
      },
      include: { telegramAccount: true },
    });
  }
}
